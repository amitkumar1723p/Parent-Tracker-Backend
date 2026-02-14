"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const connection_routes_js_1 = __importDefault(require("./connection.routes.js"));
const notification_routes_js_1 = __importDefault(require("./notification.routes.js"));
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const user_js_1 = __importDefault(require("../models/user.js"));
const tracking_routes_js_1 = __importDefault(require("./tracking.routes.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use('/auth/v1', auth_routes_js_1.default);
router.use('/connection/v1', connection_routes_js_1.default);
router.use('/notification/v1', notification_routes_js_1.default);
router.use('/tracking/v1', tracking_routes_js_1.default);
//  Genrate FireBase Token  ----- start
// "api//tracking/v1/child/update-live",
router.post("/user/fcm-token", (0, authMiddleware_js_1.verifyUser)(), async (req, res) => {
    const { token } = req.body;
    console.log("📲 Saving token for user:", req.user._id);
    console.log("📲 Token:", token);
    await user_js_1.default.updateOne({ _id: req.user._id }, { $addToSet: { fcmTokens: token } });
    res.json({ success: true });
});
// get children parent wise ---------------- start
/**
 * ✅ Get all children of logged-in parent (FAST + CLEAN)
 * -
 *  parent login required
 * - returns children list with basic profile fields
 */
router.get("/parent/children/v1", (0, authMiddleware_js_1.verifyUser)("parent"), async (req, res) => {
    try {
        const parentId = new mongoose_1.default.Types.ObjectId(req.user._id);
        const result = await user_js_1.default.aggregate([
            // 1️⃣ Match logged-in parent
            {
                $match: {
                    _id: parentId,
                    role: "parent",
                },
            },
            // 2️⃣ Convert children array into documents
            {
                $lookup: {
                    from: "users",
                    localField: "children", // parent.children = [childId1, childId2]
                    foreignField: "_id",
                    as: "childrenData",
                    pipeline: [
                        // ✅ Return only required fields (FAST)
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                avatarUrl: 1,
                                coordinates: 1,
                                batteryLevel: 1,
                                speed: 1,
                                heading: 1,
                                isMoving: 1,
                                movementStatus: 1,
                                lastLocationAt: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },
            // 3️⃣ Final response shape
            {
                $project: {
                    _id: 0,
                    parentId: "$_id",
                    children: "$childrenData",
                },
            },
        ]);
        const data = result?.[0] || { parentId: req.user._id, children: [] };
        return res.status(200).json({
            success: true,
            parentId: data.parentId,
            children: data.children,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
//   Genrate FireBase Token  ------- end
exports.default = router;
//   # combines all routes
