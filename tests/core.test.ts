import { describe, it, expect } from 'bun:test';
import { signAccessToken, verifyToken } from '../src/common/utils/jwt.js';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from '../src/common/errors/index.js';

describe('Enterprise Modular MongoDB Core Verification', () => {
  it('Signs and verifies JWT token payloads correctly', () => {
    const payload = {
      userId: 'usr_abc123',
      tenantId: 'tenant_alpha',
      email: 'alex@example.com',
      role: 'ADMIN',
    };

    const token = signAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.tenantId).toBe(payload.tenantId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.type).toBe('access');
  });

  it('Instantiates core application errors with appropriate HTTP status codes', () => {
    const notFound = new NotFoundError('User', 'usr_999');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe('NOT_FOUND');
    expect(notFound.message).toContain('usr_999');

    const badReq = new BadRequestError('Invalid token');
    expect(badReq.statusCode).toBe(400);
    expect(badReq.code).toBe('BAD_REQUEST');

    const unauthorized = new UnauthorizedError();
    expect(unauthorized.statusCode).toBe(401);
    expect(unauthorized.code).toBe('UNAUTHORIZED');

    const generic = new AppError('Custom issue', 422, 'UNPROCESSABLE');
    expect(generic.statusCode).toBe(422);
    expect(generic.code).toBe('UNPROCESSABLE');
  });
});
