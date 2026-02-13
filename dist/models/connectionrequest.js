import mongoose, { Schema } from "mongoose";
const ConnectionRequestSchema = new Schema({
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    childId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    // expiresAt: {
    //   type: Date,
    //   required: true,
    //   index: { expires: "10m" }, // ⏱ auto delete after 10 min
    // },
}, { timestamps: true });
export default mongoose.model("ConnectionRequest", ConnectionRequestSchema);
