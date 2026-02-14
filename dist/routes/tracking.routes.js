"use strict";
// # live tracking, history, daily summary
// Send child location to parent phone
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const childmoment_1 = require("../utils/childmoment");
const index_1 = require("../socket/index"); // 👈 yaha se io import
const router = (0, express_1.Router)();
/**
 * ✅ Child -> update live location
 * POST /api/location/v1/update-live
 */
// /tracking/v1
router.post("/child/update-live", (0, authMiddleware_1.verifyUser)("child"), async (req, res) => {
    try {
        console.log("child-update-live", '1');
        const childId = req.user._id;
        const { lat, lng, speed, heading, batteryLevel } = req.body;
        console.log(req.body, "req.body");
        // ✅ Validate lat/lng
        if (typeof lat !== "number" || typeof lng !== "number") {
            return res.status(400).json({ message: "lat/lng required" });
        }
        // ✅ Fetch child basic tracking fields
        const child = await user_1.default.findById(childId).select("_id parentId coordinates speed lastLocationAt movementStatus isMoving batteryLevel heading");
        if (!child) {
            return res.status(404).json({ message: "Child not found" });
        }
        if (!child.parentId) {
            return res
                .status(400)
                .json({ message: "Child not connected to parent" });
        }
        const prev = {
            lat: child.coordinates?.lat,
            lng: child.coordinates?.lng,
            speed: child.speed || 0,
        };
        const next = { lat, lng, speed: speed || 0 };
        const movement = (0, childmoment_1.getMovementStatus)({ prev, next });
        /**
         * ✅ Update latest location (DB source of truth)
         * Parent ko current info DB se bhi mil sakti hai
         */
        child.coordinates = { lat, lng };
        child.speed = speed || 0;
        child.heading = heading || 0;
        child.batteryLevel = batteryLevel ?? child.batteryLevel ?? 0;
        child.isMoving = movement.isMoving;
        child.movementStatus = movement.movementStatus;
        child.lastLocationAt = new Date();
        await child.save();
        /**
         * ✅ Emit to parent dashboard (real-time)
         * Room: parent:<parentId>
         */
        index_1.io.to(`parent:${child.parentId.toString()}`).emit("child-live-update", {
            childId: child._id.toString(),
            parentId: child.parentId.toString(),
            coordinates: child.coordinates,
            speed: child.speed,
            heading: child.heading,
            batteryLevel: child.batteryLevel,
            isMoving: child.isMoving,
            movementStatus: child.movementStatus,
            lastLocationAt: child.lastLocationAt,
        });
        return res.status(200).json({
            success: true,
            message: "Live location updated",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
