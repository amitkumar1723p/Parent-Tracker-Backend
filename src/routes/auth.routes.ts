import { Router } from "express";
import { z } from "zod";
import User from "../models/user";
import { signJWT } from "../utils/jwt";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["PARENT", "CHILD", "EMPLOYEE"]),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, phone } = parsed.data;

  if (!email && !phone)
    return res
      .status(400)
      .json({ ok: false, message: "Email or phone required" });

  if (email && (await User.findOne({ email })))
    return res.status(409).json({ ok: false, message: "Email in use" });
  if (phone && (await User.findOne({ phone })))
    return res.status(409).json({ ok: false, message: "Phone in use" });

  const user = await User.create(parsed.data);
  const token = signJWT(user);
  res.json({
    ok: true,
    token,
    user: { id: user._id, name: user.name, role: user.role },
  });
});

const loginSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { emailOrPhone, password } = parsed.data;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("+password");
  if (!user)
    return res.status(401).json({ ok: false, message: "Invalid credentials" });

  const match = await user.comparePassword(password);
  if (!match)
    return res.status(401).json({ ok: false, message: "Invalid credentials" });

  const token = signJWT(user);
  res.json({
    ok: true,
    token,
    user: { id: user._id, name: user.name, role: user.role },
  });
});

export default router;
