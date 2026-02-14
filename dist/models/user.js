"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/User.ts
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    // ✅ Child fields
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.model("User", UserSchema);
