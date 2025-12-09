
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export function signTempToken(email: string) {
  return jwt.sign({ email, temp: true }, SECRET, { expiresIn: '10m' });
}

export function signUserToken(user: any) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
