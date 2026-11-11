import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
  email?: string;
  type?: 'access' | 'refresh';
}

export const signAccessToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
};

export const signRefreshToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwt.secret, {
    expiresIn: '30d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};
