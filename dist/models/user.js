// src/models/User.ts
// ✔ This model represents your main app user.
// ✔ Works perfectly with OTP-based auth (no password required)
import mongoose, { Schema } from 'mongoose';
// Mongoose schema for User collection
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // OTP login based
    phone: { type: String }, // Optional field
    role: {
        type: String,
        enum: ['parent', 'child',],
        required: true,
    },
    gender: { type: String },
    avatarUrl: String, // optional
    // parent field --- start
    inviteCode: {
        type: String,
        unique: true,
        sparse: true, // allow null for child users
    },
    children: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    // parent field --- end
    // 👶 Child fields
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    isBlocked: {
        type: Boolean,
    },
    fcmTokens: { type: [String], default: [] }
}, { timestamps: true });
export default mongoose.model('User', UserSchema);
