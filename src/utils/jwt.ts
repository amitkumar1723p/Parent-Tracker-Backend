//  # JWT sign/verify utils

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { IUser } from '../models/user';
export function signJWT(user: IUser) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name },
    env.JWT_SECRET
    // { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function verifyJWT<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
