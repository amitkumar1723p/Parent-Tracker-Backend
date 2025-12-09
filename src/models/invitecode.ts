//  # Invite code for parent–child linking
// invitecode.ts


import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IInviteCode extends Document {
    code: string; // 6 digit
    parentId: Types.ObjectId;
    childId?: Types.ObjectId;
    expiresAt: Date;
    status: 'ACTIVE' | 'USED' | 'EXPIRED';
}


const InviteCodeSchema = new Schema<IInviteCode>(
    {
        code: { type: String, required: true, unique: true },
        parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        childId: { type: Schema.Types.ObjectId, ref: 'User' },
        expiresAt: { type: Date, required: true },
        status: { type: String, enum: ['ACTIVE', 'USED', 'EXPIRED'], default: 'ACTIVE' }
    },
    { timestamps: true }
);

InviteCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-clean

export default mongoose.model<IInviteCode>('InviteCode', InviteCodeSchema);
