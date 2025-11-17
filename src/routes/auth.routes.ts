// src/routes/auth.routes.ts
// ✔ COMPLETE AUTH ROUTES FOR OTP LOGIN
// ✔ /send-otp → generate + send OTP
// ✔ /verify-otp → verify OTP + return temp token
// ✔ /complete-profile → final user creation + JWT token

import { Router } from 'express';
import { z } from 'zod';
import Otp from '../models/Otp';
import User from '../models/user';
import { signUserToken } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/mail';

const router = Router();

/* ---------------------------------------------------------
   📌 1. SEND OTP
---------------------------------------------------------- */

router.post('/send-otp', async (req, res) => {
  try {
    console.log('send otp');
    const bodySchema = z.object({
      email: z.string().email(),
    });

    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: parsed.error, // optional
      });

    const { email } = parsed.data;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove existing OTP (cleanup)
    await Otp.deleteMany({ email });

    // Save OTP with 5 min expiry
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // TODO: Send email via nodemailer
    // console.log('📩 OTP for', email, '=', otp);
    await sendOtpEmail(email, otp); // <<--- real email send

    res.status(200).json({
      status: true,
      message: 'OTP sent successfully',
    });
  } catch (err) {
    console.error('SEND OTP ERROR:', err);
    res.status(500).json({ status: false, message: 'Failed to send OTP' });
  }
});

/* ---------------------------------------------------------
   📌 2. VERIFY OTP
---------------------------------------------------------- */

interface VerifyOtpResponse {
  status: boolean;
  message: string;
  token?: string;
  user?: any;
}
router.post('/verify-otp', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().length(6),
    });

    //  console.log(req.body ,"req.body")
    const parsed = schema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: parsed.error, // optional
      });

    const { email, otp } = parsed.data;

    // Check in DB
    const record = await Otp.findOne({ email, otp });

    if (!record)
      return res.status(400).json({ status: false, message: 'Invalid OTP' });

    if (record.expiresAt < new Date())
      return res.status(400).json({ status: false, message: 'OTP Expired' });

    // Mark OTP as verified
    record.verified = true;
    await record.save();

    //  Check user is exit or not
    let exists = await User.findOne({ email });
    let response: VerifyOtpResponse = {
      status: true,
      message: 'OTP Verified',
    };
    if (exists) {
      const token = signUserToken(exists);
      response.token = token;
      response.user = exists;
    }

    res.status(200).json(response);
  } catch (err) {
    console.error('VERIFY OTP ERROR:', err);
    res.status(500).json({ status: false, message: 'OTP Verification Failed' });
  }
});

/* ---------------------------------------------------------
   📌 3. COMPLETE PROFILE (Register User)
---------------------------------------------------------- */

router.post('/complete-profile', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      gender: z.string().optional(),
      name: z.string().min(2),
      role: z.enum(['PARENT', 'CHILD', 'EMPLOYEE']),
      phone: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    // tempToken,
    const { name, role, phone, email, gender } = parsed.data;

    // Verify temporary token
    // const decoded: any = verifyToken(tempToken);

    // if (!decoded.temp)
    //   return res.json({ status: false, message: 'Invalid temp token' });

    // const email = decoded.email;

    // If user already exists → return directly
    let exists = await Otp.findOne({ email, verified: true });

    if (!exists) {
      return res.json({
        status: false,
        message: 'Email is not Verifu',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      role,
      phone,
      gender,
    });

    // Generate final login token
    const token = signUserToken(user);

    res.json({
      status: true,
      message: 'Profile Completed',
      token,
      user,
    });
  } catch (err) {
    console.error('COMPLETE PROFILE ERROR:', err);
    res
      .status(500)
      .json({ status: false, message: 'Failed to complete profile' });
  }
});

export default router;
