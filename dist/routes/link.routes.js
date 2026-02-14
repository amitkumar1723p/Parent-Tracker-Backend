"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * 📌 Child connects to Parent using inviteCode
 * Endpoint: POST /connect-parent
 */
router.post("/connect-parent", (0, authMiddleware_1.verifyUser)(), async (req, res) => {
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
        const parent = await user_1.default.findOne({ inviteCode, role: "parent" });
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
        await user_1.default.updateOne({ _id: req.user._id }, { $set: { parentId: parent._id } });
        // Add child to parent's children array (if not exists)
        if (!parent.children)
            parent.children = [];
        if (!parent.children.includes(req.user._id)) {
            parent.children.push(req.user._id);
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
    }
    catch (error) {
    }
});
exports.default = router;
