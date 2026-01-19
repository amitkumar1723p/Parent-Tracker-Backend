import { Router, Response } from "express";
import User from "../models/user";
import ConnectionRequest from "../models/connectionrequest";
import { verifyUser } from "../middlewares/authMiddleware";
import mongoose from "mongoose";
import { sendPush } from "../services/notificationService";
import Notification from "../models/Notification";
const router = Router();

/**
 * 👶 Child sends connection request
 */
router.post("/request-parent", verifyUser(), async (req: any, res: Response) => {
    try {
        const child = req.user;
        const { inviteCode } = req.body;

        if (child?.role !== "child") {
            return res.status(403).json({ message: "Only child can request" });
        }

        if (!inviteCode) {
            return res.status(400).json({ message: "Invite code required" });
        }

        const parent = await User.findOne({ inviteCode, role: "parent" });
        if (!parent) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        // ✅ If already connected
        const isConnected = await User.exists({
            _id: child._id,
            role: "child",
            parentId: { $exists: true, $ne: null },
        });

        if (isConnected) {
            return res.status(400).json({ message: "Child already connected to a parent" });
        }

        // 🔔 notify parent function (same as yours)
        const notifyParent = () =>
            Promise.all([
                Notification.create({
                    userId: parent._id,
                    title: "You have a new connection",
                    body: `${child.name} wants to stay connected with you`,
                    data: {
                        type: "CONNECTION_REQUEST",
                        childId: child._id,
                    },
                }),
                sendPush(
                    parent.fcmTokens || [],
                    "You have a new connection",
                    `${child.name} wants to stay connected with you on SafeTracker`,
                    {
                        type: "CONNECTION_REQUEST",
                        childId: child._id.toString(),
                    }
                ),
            ]);

        // ✅ Find ANY old request (pending/rejected)
        const existingRequest = await ConnectionRequest.findOne({
            parentId: parent._id,
            childId: child._id,
        });

        // ✅ If already pending → don't create again
        if (existingRequest?.status === "pending") {
            await notifyParent();
            return res.status(200).json({ message: "Connection request already sent" });
        }

        // ✅ If rejected → convert back to pending
        if (existingRequest?.status === "rejected") {
            existingRequest.status = "pending";
            await existingRequest.save();

            await notifyParent();

            return res.status(200).json({
                message: "Connection request sent again",
            });
        }

        // ✅ If approved (rare case, but safe)
        if (existingRequest?.status === "approved") {
            return res.status(400).json({
                message: "Request already approved previously",
            });
        }

        // ✅ If no request exists → create new
        await ConnectionRequest.create({
            parentId: parent._id,
            childId: child._id,
            status: "pending",
        });

        await notifyParent();

        return res.status(200).json({ message: "Connection request sent to parent" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
});





router.get(
    "/parent/connection-requests",
    verifyUser('parent'),
    async (req: any, res: Response) => {
        try {


            const requests = await ConnectionRequest.aggregate([
                // 1️⃣ Match parent + pending
                {
                    $match: {
                        parentId: new mongoose.Types.ObjectId(req.user._id),
                        status: "pending",
                    },
                },

                // 2️⃣ Lookup child user
                {
                    $lookup: {
                        from: "users", // 🔴 MongoDB collection name (User model ka)
                        localField: "childId",
                        foreignField: "_id",
                        as: "child",
                    },
                },

                // 3️⃣ child array → object
                {
                    $unwind: "$child",
                },

                // 4️⃣ Select required fields
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        createdAt: 1,

                        child: {
                            _id: "$child._id",
                            name: "$child.name",
                            email: "$child.email",
                            avatarUrl: "$child.avatarUrl",
                        },
                    },
                },

                // 5️⃣ Latest first (optional)
                {
                    $sort: { createdAt: -1 },
                },
            ]);

            res.json({ requests });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);


/**
 * ✅ Parent approves request
 */
router.post(
    "/approve-connection",
    verifyUser("parent"),
    async (req: any, res: Response) => {


        try {
            const { childId } = req.body;
            console.log(req.body, "req.body")
            const request = await ConnectionRequest.findOne({ childId: childId });
            if (!request || request.status !== "pending") {
                return res.status(404).json({ message: "Request not found" });
            }

            // Link both users
            await User.updateOne(
                { _id: request.childId },
                { parentId: request.parentId }
            );

            await User.updateOne(
                { _id: request.parentId },
                { $addToSet: { children: request.childId } }
            );

            request.status = "approved";
            await request.save();

            return res.status(200).json({ message: "Connection approved" });

        } catch (error) {
            console.log(error, "error")
            res.status(500).json({ message: "Server error" });
        }



    }
);

/**
 * ❌ Parent rejects request
 */
router.post(
    "/reject-connection",
    verifyUser("parent"),
    async (req: any, res: Response) => {

        try {

            const { childId } = req.body;
            console.log(req.body, "req.body")

            const request = await ConnectionRequest.findOne({ childId: childId });
            if (!request || request.status !== "pending") {
                return res.status(404).json({ message: "Request not found" });
            }

            await ConnectionRequest.findByIdAndUpdate(request?._id, {
                status: "rejected",
            });

            res.status(200).json({ message: "Connection rejected" });

        }
        catch (error) {
            console.log(error, "error")
            res.status(500).json({ message: "Server error" });
        }
    }
);






export default router;
