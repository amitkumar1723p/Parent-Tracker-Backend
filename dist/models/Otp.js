// src/models/Otp.ts
// ✔ Stores OTP for email verification
// ✔ Auto expires after 5 minutes
import mongoose, { Schema } from 'mongoose';
const OtpSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Otp', OtpSchema);
