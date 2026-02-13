// src/models/User.ts
import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    // ✅ Basic info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: {
        type: String,
        enum: ["parent", "child"],
        required: true,
    },
    gender: { type: String },
    avatarUrl: { type: String },
    // ✅ Parent fields
    inviteCode: {
        type: String,
        unique: true,
        sparse: true, // allow null/undefined
    },
    children: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    // ✅ Child fields
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    // ✅ Live tracking fields (child)
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    speed: { type: Number, }, // m/s
    heading: { type: Number, }, // degrees
    batteryLevel: { type: Number, }, // 0-100
    isMoving: { type: Boolean },
    movementStatus: {
        type: String,
        enum: ["STOPPED", "MOVING", "RUNNING"],
    },
    lastLocationAt: { type: Date },
    // ✅ Block + FCM
    isBlocked: { type: Boolean, default: false },
    fcmTokens: { type: [String], default: [] },
}, { timestamps: true });
export default mongoose.model("User", UserSchema);
