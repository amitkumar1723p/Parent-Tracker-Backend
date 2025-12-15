import mongoose, { Schema, Document } from "mongoose";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface IConnectionRequest extends Document {
  parentId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  status: RequestStatus;
  expiresAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>(
  {
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
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "10m" }, // ⏱ auto delete after 10 min
    },
  },
  { timestamps: true }
);

export default mongoose.model<IConnectionRequest>(
  "ConnectionRequest",
  ConnectionRequestSchema
);
