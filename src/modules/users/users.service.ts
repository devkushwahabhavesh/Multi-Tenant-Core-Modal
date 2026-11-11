import { UserModel } from './user.model.js';
import { NotFoundError } from '../../core/errors.js';

export class UsersService {
  static async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      UserModel.find({}, { passwordHash: 0 }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getUserById(id: string) {
    const user = await UserModel.findById(id, { passwordHash: 0 });
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }
}

