import { Router, Request, Response } from "express";
import User from "../models/user";
import { verifyUser } from '../middlewares/authMiddleware'
import mongoose from "mongoose";

const router = Router();

/**
 * 📌 Child connects to Parent using inviteCode
 * Endpoint: POST /connect-parent
 */

router.post("/connect-parent", verifyUser, async (req: any, res: Response) => {


    try {


        const child = req.user;
        const { inviteCode } = req.body;



        if (!inviteCode) {
            return res.status(400).json({
                status: false,
                message: "Invite code is required",
            });
        }

        // Ensure user with code exists and is a parent
        const parent = await User.findOne({ inviteCode, role: "parent" });

        if (!parent) {
            return res.status(404).json({
                status: false,
                message: "Invalid invite code",
            });
        }



        // Prevent duplicate connection



        if (child?.parentId && child?.parentId?.toString() === parent?._id?.toString()) {
            return res.status(200).json({
                status: true,
                message: "Child already connected to this parent",
            });
        }


        // ✅ Direct child update (NO FETCH)
        await User.updateOne(
            { _id: req.user.id },
            { $set: { parentId: parent._id } }
        );






        // Add child to parent's children array (if not exists)
        if (!parent.children) parent.children = [];


        if (!parent.children.includes(req.user.id)) {
            parent.children.push(req.user.id);
            await parent.save();
        }




        return res.status(200).json({
            status: true,
            message: "Child successfully connected to parent",
            parent: {
                _id: parent._id,
                name: parent.name,
                email: parent.email,
            },
        });
    } catch (error) {

    }
})

export default router
