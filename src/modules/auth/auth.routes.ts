import { RouteDefinition, createModuleRouter } from '../../middleware/route-builder.js';
import { authController } from './auth.controller.js';
import * as Validation from './auth.validation.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter, sensitiveLimiter } from '../../middleware/rate-limiter.js';

const routes: RouteDefinition[] = [
  {
    method: 'post',
    path: '/register',
    middlewares: [authLimiter],
    schema: Validation.RegisterSchema,
    handler: authController.handleRegister,
  },
  {
    method: 'post',
    path: '/login',
    middlewares: [authLimiter],
    schema: Validation.LoginSchema,
    handler: authController.handleLogin,
  },
  {
    method: 'post',
    path: '/refresh-token',
    middlewares: [authLimiter],
    schema: Validation.RefreshTokenSchema,
    handler: authController.handleRefreshToken,
  },
  {
    method: 'post',
    path: '/logout',
    middlewares: [authenticate],
    handler: authController.handleLogout,
  },
  {
    method: 'post',
    path: '/forgot-password',
    middlewares: [sensitiveLimiter],
    schema: Validation.ForgotPasswordSchema,
    handler: authController.handleForgotPassword,
  },
  {
    method: 'post',
    path: '/reset-password',
    middlewares: [sensitiveLimiter],
    schema: Validation.ResetPasswordSchema,
    handler: authController.handleResetPassword,
  },
  {
    method: 'post',
    path: '/change-password',
    middlewares: [authenticate, sensitiveLimiter],
    schema: Validation.ChangePasswordSchema,
    handler: authController.handleChangePassword,
  },
  {
    method: 'post',
    path: '/verify-email',
    middlewares: [sensitiveLimiter],
    schema: Validation.VerifyEmailSchema,
    handler: authController.handleVerifyEmail,
  },
  {
    method: 'get',
    path: '/me',
    middlewares: [authenticate],
    handler: authController.handleMe,
  },
];

export const authRouter = createModuleRouter(routes);
