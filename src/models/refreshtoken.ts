import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30, // ⏳ auto delete after 30 days
    },
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
