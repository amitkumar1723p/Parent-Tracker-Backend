// //  # JWT sign/verify utils

// import jwt from 'jsonwebtoken';
// import { env } from '../config/env.js';
// import { IUser } from '../models/user';
// export function signJWT(user: IUser) {
//   return jwt.sign(
//     { sub: user._id.toString(), role: user.role, name: user.name },
//     env.JWT_SECRET,
//     { expiresIn: '7d' } // options object
//     // { expiresIn: env.JWT_EXPIRES_IN }
//   );
// }

// export function verifyJWT<T = any>(token: string): T {
//   return jwt.verify(token, env.JWT_SECRET) as T;
// }

// new   code -------------------------------------------

// src/utils/jwt.ts
// ✔ JWT generation for login token and temp token

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
