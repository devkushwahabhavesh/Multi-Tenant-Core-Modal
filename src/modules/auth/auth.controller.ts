import { Request, Response } from 'express';
import { AuthService, authService } from './auth.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  public handleRegister = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.register(req.body);
    return sendSuccess(res, result, 201);
  };

  public handleLogin = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.login(req.body);
    return sendSuccess(res, result);
  };

  public handleRefreshToken = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.refreshSession(req.body.refreshToken);
    return sendSuccess(res, result);
  };

  public handleLogout = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const refreshToken = req.body?.refreshToken;
    const result = await this.service.logout(userId, refreshToken);
    return sendSuccess(res, result);
  };

  public handleForgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.forgotPassword(req.body.email);
    return sendSuccess(res, result);
  };

  public handleResetPassword = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.resetPassword(req.body.token, req.body.newPassword);
    return sendSuccess(res, result);
  };

  public handleChangePassword = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.service.changePassword(
      userId,
      req.body.oldPassword,
      req.body.newPassword
    );
    return sendSuccess(res, result);
  };

  public handleVerifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.verifyEmail(req.body.token);
    return sendSuccess(res, result);
  };

  public handleMe = async (req: Request, res: Response): Promise<Response> => {
    return sendSuccess(res, { user: req.user });
  };
}

export const authController = new AuthController();
