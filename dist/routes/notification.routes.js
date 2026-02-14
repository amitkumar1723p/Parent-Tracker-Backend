"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = __importDefault(require("../models/Notification"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get("/get-me", (0, authMiddleware_1.verifyUser)(), async (req, res) => {
    const notifications = await Notification_1.default.find({
        userId: req?.user?._id,
    })
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({ notifications });
});
exports.default = router;
