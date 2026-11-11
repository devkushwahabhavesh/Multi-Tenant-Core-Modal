import bcrypt from 'bcryptjs';
import { UserModel } from '../users/user.model.js';
import { ConflictError, UnauthorizedError } from '../../core/errors.js';
import { signToken } from '../../shared/utils/jwt.js';

export class AuthService {
  static async register(input: {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'ADMIN' | 'MANAGER';
  }) {
    const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictError(`User with email '${input.email}' already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await UserModel.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      role: input.role || 'USER',
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  static async login(input: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}

