//  # Invite code for parent–child linking
// invitecode.ts
import mongoose, { Schema } from 'mongoose';
const InviteCodeSchema = new Schema({
    code: { type: String, required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'USED', 'EXPIRED'], default: 'ACTIVE' }
}, { timestamps: true });
InviteCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-clean
export default mongoose.model('InviteCode', InviteCodeSchema);
