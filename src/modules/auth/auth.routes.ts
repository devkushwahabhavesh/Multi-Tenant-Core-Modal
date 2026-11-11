import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterSchema, LoginSchema } from './auth.schemas.js';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { authenticate } from '../../shared/middleware/auth.js';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post(
  '/register',
  validate(RegisterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, result, 201);
  })
);

// POST /api/v1/auth/login
authRouter.post(
  '/login',
  validate(LoginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return sendSuccess(res, result);
  })
);

// GET /api/v1/auth/me
authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    return sendSuccess(res, { user: req.user });
  })
);

