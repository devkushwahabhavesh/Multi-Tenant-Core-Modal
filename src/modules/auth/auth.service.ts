import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { userController } from '../users/user.controller.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../common/errors/index.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../../common/utils/jwt.js';
import { logger } from '../../common/logger/logger.js';

export class AuthService {
  constructor(private userCtrl = userController) {}

  public async register(input: {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'ADMIN' | 'MANAGER';
    tenantId?: string;
  }) {
    const existing = await this.userCtrl.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictError(`User with email '${input.email}' already exists in this tenant`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);
    const tenantId = input.tenantId || 'tenant_default';
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.userCtrl.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      role: input.role || 'USER',
      isActive: true,
      isVerified: false,
      verificationToken,
      refreshTokens: [],
    });

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });

    await this.userCtrl.update(user.id, { $push: { refreshTokens: refreshToken } } as any);

    logger.info(`User registered successfully: [${user.email}] in tenant [${tenantId}]`);

    return {
      accessToken,
      refreshToken,
      verificationToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId,
      },
    };
  }

  public async login(input: { email: string; password: string }) {
    const user = await this.userCtrl.findOne({ email: input.email.toLowerCase() });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tenantId = user.tenantId || 'tenant_default';
    const accessToken = signAccessToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });

    await this.userCtrl.update(user.id, { $push: { refreshTokens: refreshToken } } as any);

    logger.info(`User logged in: [${user.email}]`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId,
      },
    };
  }

  public async refreshSession(token: string) {
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userCtrl.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(token)) {
      throw new UnauthorizedError('Refresh token revoked or invalid');
    }

    // Token rotation
    const tenantId = user.tenantId || 'tenant_default';
    const newAccessToken = signAccessToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });

    await this.userCtrl.update(user.id, {
      $pull: { refreshTokens: token },
    } as any);
    await this.userCtrl.update(user.id, {
      $push: { refreshTokens: newRefreshToken },
    } as any);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.userCtrl.update(userId, { $pull: { refreshTokens: refreshToken } } as any);
    } else {
      await this.userCtrl.update(userId, { $set: { refreshTokens: [] } } as any);
    }
    return { loggedOut: true };
  }

  public async forgotPassword(email: string) {
    const user = await this.userCtrl.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: 'If an account exists, a password reset link has been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600 * 1000);

    await this.userCtrl.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    logger.info(`Password reset token generated for [${email}]`);

    return {
      message: 'If an account exists, a password reset link has been dispatched.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  public async resetPassword(token: string, newPassword: string) {
    const user = await this.userCtrl.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() } as any,
    });
    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.userCtrl.update(user.id, {
      passwordHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      refreshTokens: [],
    });

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  public async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.userCtrl.findById(userId);
    if (!user) throw new NotFoundError('User', userId);

    const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await this.userCtrl.update(userId, {
      passwordHash,
      refreshTokens: [],
    });

    return { message: 'Password changed successfully. Active sessions revoked.' };
  }

  public async verifyEmail(token: string) {
    const user = await this.userCtrl.findOne({ verificationToken: token });
    if (!user) {
      throw new BadRequestError('Invalid or expired email verification token');
    }

    await this.userCtrl.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
    });

    return { message: 'Email verified successfully.' };
  }
}

export const authService = new AuthService();
