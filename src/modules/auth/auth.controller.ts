import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, result, 201);
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    return sendSuccess(res, result);
  }

  static async me(req: Request, res: Response) {
    return sendSuccess(res, { user: req.user });
  }
}

