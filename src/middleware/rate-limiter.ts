import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { extractTenantId } from './tenant.js';

export interface RateLimiterCustomOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
}

/**
 * Creates a rate limiter instance with tenant-aware key generator and standardized JSON error response.
 */
export const createRateLimiter = (options: RateLimiterCustomOptions = {}) => {
  const windowMs = options.windowMs ?? 15 * 60 * 1000; // default 15 minutes
  const max = options.max ?? 100;
  const message = options.message ?? 'Too many requests, please try again later.';

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
      const tenantId = extractTenantId(req);
      const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
      return `${tenantId}:${ip}`;
    },
    handler: (_req: Request, res: Response) => {
      res.status(options.statusCode ?? 429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    },
  });
};

/**
 * Standard API rate limiter: 100 requests per 15 minutes per tenant/IP.
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'API request limit exceeded. Please try again after 15 minutes.',
});

/**
 * Authentication rate limiter: 10 requests per 15 minutes to prevent brute-force attacks.
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

/**
 * Sensitive endpoints rate limiter (e.g. password reset, role deletion, permission approvals): 5 requests per 15 minutes.
 */
export const sensitiveLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many sensitive operations requested. Please try again later.',
});
