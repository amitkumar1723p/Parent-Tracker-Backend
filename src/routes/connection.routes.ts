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
router.post(
    "/request-parent",
    verifyUser,
    async (req: any, res: Response) => {
        try {

            const child = req?.user;
            console.log('running code ...')

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

            // Already connected
            const isValidChild = await User.exists({
                _id: req?.user?.id,
                role: "child",
                parentId: { $exists: true, $ne: null }
            });

            if (isValidChild) {
                return res.status(400).json({
                    message: "Child already connected to a parent",
                });
            }

            // Existing pending request
            const existing = await ConnectionRequest.findOne({
                parentId: parent?._id,
                childId: child?.id,
                status: "pending",
            });

            console.log('before notifyParent ...')

            // 🔔 common notification logic   --- start
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
                            childId: child?._id?.toString() || '',
                        }
                    ),
                ]);


            console.log("all redy set conection")
            if (existing) {
                if (existing) {
                    await notifyParent();
                    return res.status(200).json({
                        message: "Connection request already sent",
                    });
                }


                return res.status(200).json({
                    message: "Connection request already sent",
                });
            }


            await ConnectionRequest.create({
                parentId: parent?._id,
                childId: child?.id,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
            });



            console.log("new connection hit notify")

            // 🚀 Non-critical async work
            await notifyParent();






            // 🔔 Later: send push notification to parent
            return res.status(200).json({
                message: "Connection request sent to parent",
            });
        } catch (err) {
            console.log(err, "err")
            return res.status(500).json({ message: "Server error" });
        }
    }
);




router.get(
    "/parent/connection-requests",
    verifyUser,
    async (req: any, res: Response) => {
        try {
            if (req.user.role !== "parent") {
                return res.status(403).json({ message: "Only parent allowed" });
            }

            const requests = await ConnectionRequest.aggregate([
                // 1️⃣ Match parent + pending
                {
                    $match: {
                        parentId: new mongoose.Types.ObjectId(req.user.id),
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
    verifyUser,
    async (req: any, res: Response) => {
        const { requestId } = req.body;

        if (req.user.role !== "parent") {
            return res.status(403).json({ message: "Only parent allowed" });
        }

        const request = await ConnectionRequest.findById(requestId);
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

        return res.json({ message: "Connection approved" });
    }
);

/**
 * ❌ Parent rejects request
 */
router.post(
    "/reject-connection",
    verifyUser,
    async (req: any, res: Response) => {
        const { requestId } = req.body;

        await ConnectionRequest.findByIdAndUpdate(requestId, {
            status: "rejected",
        });

        res.json({ message: "Connection rejected" });
    }
);






export default router;
