// src/models/User.ts
// ✔ This model represents your main app user.
// ✔ Works perfectly with OTP-based auth (no password required)

import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'PARENT' | 'CHILD' | 'EMPLOYEE';

// Interface defining what fields a user will have
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  gender?: string;
}

// Mongoose schema for User collection
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true }, // OTP login based
    phone: { type: String }, // Optional field

    role: {
      type: String,
      enum: ['PARENT', 'CHILD', 'EMPLOYEE'],
      required: true,
    },

    gender: { type: String },
    avatarUrl: String, // optional
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
