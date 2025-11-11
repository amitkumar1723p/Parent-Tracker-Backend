import mongoose, { Schema, Document } from 'mongoose'; //  # MongoDB models (Mongoose schemas)
import bcrypt from 'bcryptjs';
export type UserRole = 'PARENT' | 'CHILD' | 'EMPLOYEE';

// ✅ User Interface: Ye batata hai user document me kya-kya fields honi chahiye
export interface IUser extends Document {
  _id: string; // 👈 Add this line
  name: string;
  email?: string;
  phone?: string;
  password: string; // hashed
  role: UserRole;
  avatarUrl?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

// ✅ Mongoose Schema: Database me User record kaisa hoga wo define karta hai

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, index: true, sparse: true },
    phone: { type: String, index: true, sparse: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['PARENT', 'CHILD', 'EMPLOYEE'],
      required: true,
    },
    avatarUrl: String,
  },
  { timestamps: true }
);

// ✅ 'pre-save' hook: DB me save hone se pehle ye function chalega
UserSchema.pre('save', async function () {
  // 👉 Agar password change nahi hua (e.g. sirf name update kiya),
  // to dobara hash karne ki zaroorat nahi — yaha se hi return
  if (!this.isModified('password')) return;

  // 👉 Salt generate karo jisse hashing aur strong ho
  // 10 = rounds (jitna zyada utni security but slow)
  const salt = await bcrypt.genSalt(10);

  // 👉 Password ko bcrypt se hash karo aur database me hashed form me save karo
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ comparePassword method: Login ke time user ke input password ko verify karta hai
UserSchema.methods.comparePassword = async function (candidate: string) {
  // 👉 bcrypt.compare:
  // entered password ko hashed password se compare karta hai
  // Agar match hua to true return karega, warna false
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
