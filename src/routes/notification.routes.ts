

import { Router } from "express";
import Notification from "../models/Notification";

import { verifyUser } from "../middlewares/authMiddleware";
const router = Router();
router.get(
    "/get-me",
    verifyUser,
    async (req, res) => {
        const notifications = await Notification.find({
            userId: req?.user?.id,
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ notifications });
    }
);




export default router;
