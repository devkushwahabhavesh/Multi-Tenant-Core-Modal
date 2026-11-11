import { Router, Request, Response } from 'express';
import { UsersService } from './users.service.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';

export const usersRouter = Router();

// GET /api/v1/users - List users (Admin/Manager only)
usersRouter.get(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const result = await UsersService.listUsers(page, limit);
    return sendSuccess(res, result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  })
);

// GET /api/v1/users/:id - Get user profile
usersRouter.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getUserById(req.params.id);
    return sendSuccess(res, user);
  })
);

