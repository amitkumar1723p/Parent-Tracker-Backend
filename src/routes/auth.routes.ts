import { Router } from 'express';
import { z } from 'zod';
import User from '../models/user';
import { signJWT } from '../utils/jwt';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['PARENT', 'CHILD', 'EMPLOYEE']),
});

// ✅ POST route for user registration
router.post('/register', async (req, res) => {
  // Step 1: Validate incoming request body with Zod schema
  const parsed = registerSchema.safeParse(req.body);

  // Step 2: If validation fails, return 400 with error details
  if (!parsed.success) return res.status(400).json(parsed.error);

  // Step 3: Destructure email and phone from validated data
  const { email, phone } = parsed.data;

  // Step 4: Ensure that at least one (email or phone) is provided
  if (!email && !phone)
    return res
      .status(400)
      .json({ ok: false, message: 'Email or phone required' });

  // Step 5: Check if email already exists in DB
  if (email && (await User.findOne({ email })))
    return res.status(409).json({ ok: false, message: 'Email in use' });

  // Step 6: Check if phone already exists in DB
  if (phone && (await User.findOne({ phone })))
    return res.status(409).json({ ok: false, message: 'Phone in use' });

  // Step 7: Create new user in the database using validated data
  const user = await User.create(parsed.data);

  // Step 8: Generate JWT token for the created user
  const token = signJWT(user);

  // Step 9: Send success response with token and basic user info
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

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { emailOrPhone, password } = parsed.data;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select('+password');
  if (!user)
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });

  const match = await user.comparePassword(password);
  if (!match)
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });

  const token = signJWT(user);
  res.json({
    ok: true,
    token,
    user: { id: user._id, name: user.name, role: user.role },
  });
});

export default router;
