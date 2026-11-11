import { describe, it, expect } from 'bun:test';
import { signToken, verifyToken } from '../src/shared/utils/jwt.js';
import { AppError, NotFoundError, UnauthorizedError } from '../src/core/errors.js';

describe('Generic Core & Shared Utilities', () => {
  it('Signs and verifies JWT token payloads correctly', () => {
    const payload = {
      userId: 'usr_abc123',
      email: 'alex@example.com',
      role: 'ADMIN',
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('Instantiates core application errors with appropriate HTTP status codes', () => {
    const notFound = new NotFoundError('Order', 'ord_999');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe('NOT_FOUND');
    expect(notFound.message).toContain('ord_999');

    const unauthorized = new UnauthorizedError();
    expect(unauthorized.statusCode).toBe(401);
    expect(unauthorized.code).toBe('UNAUTHORIZED');

    const generic = new AppError('Custom issue', 422, 'UNPROCESSABLE');
    expect(generic.statusCode).toBe(422);
    expect(generic.code).toBe('UNPROCESSABLE');
  });
});

