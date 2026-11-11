import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  role: string;
  email?: string;
  [key: string]: unknown;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}
