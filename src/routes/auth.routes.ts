// src/routes/auth.routes.ts
// ✔ COMPLETE AUTH ROUTES FOR OTP LOGIN
// ✔ /send-otp → generate + send OTP
// ✔ /verify-otp → verify OTP + return temp token
// ✔ /complete-profile → final user creation + JWT token


import { Router } from "express";
import { z } from 'zod';
import { upload } from "../middlewares/upload";
import Otp from '../models/Otp';
import User from '../models/user';
import { signUserToken } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/mail';
import { uploadToS3 } from "../utils/uploadToS3";

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
    console.log(otp, "otp")

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
  AuthenticationToken?: string;
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
    let exists = await User.findOne({ email }).lean();;
    let response: VerifyOtpResponse = {
      status: true,
      message: 'OTP Verified',
    };
    if (exists) {
      const AuthenticationToken = signUserToken(exists);
      response.AuthenticationToken = AuthenticationToken;
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

router.post('/complete-profile',
  upload.single("profilePhoto"),   // <- IMPORTANT
  async (req, res) => {

    try {
      const schema = z.object({
        email: z.string().email(),
        gender: z.string().optional(),
        name: z.string().min(2),
        role: z.enum(['parent', 'child',]),
        phone: z.string().optional(),
      });


      console.log(req.body, "req.body")



      const parsed = schema.safeParse(req.body);

      if (!parsed.success) return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: parsed.error, // optional
      });
      // tempToken,
      const { name, role, phone, email, gender } = parsed.data;



      //  check user  is all ready exit ya not
      let isExitUer = await User.findOne({ email }).lean();
      if (isExitUer) {
        return res.status(409).json({
          status: false,
          message: 'User already exists'
        });
      }


      let exists = await Otp.findOne({ email, verified: true }).lean();;



      if (!exists) {
        return res.status(400).json({
          status: false,
          message: 'Email is not Verify',
        });
      }


      // Upload image to S3
      let profilePhotoUrl: string | null = null;
      if (req.file) {
        profilePhotoUrl = await uploadToS3(req.file);
      }
      // Create new user
      const user = await User.create({
        name,
        email,
        role,
        phone,
        gender,
        avatarUrl: profilePhotoUrl
      });
      await Otp.deleteOne({ email, verified: true });

      // Generate final login token
      const AuthenticationToken = signUserToken(user);
      console.log(user, "user")

      res.status(200).json({
        status: true,
        message: 'Profile Completed',
        AuthenticationToken,
        user: {
          name,
          email,
          role,
          phone,
          gender,
          avatarUrl: profilePhotoUrl
        },
      });
    } catch (err) {
      console.error('COMPLETE PROFILE ERROR:', err);
      res
        .status(500)
        .json({ status: false, message: 'Failed to complete profile' });
    }
  });

export default router;
