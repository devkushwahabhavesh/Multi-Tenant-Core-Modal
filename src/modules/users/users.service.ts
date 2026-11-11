import { BaseService } from '../../shared/services/base.service.js';
import { UserModel, IUser } from './user.model.js';

export class UsersService extends BaseService<IUser> {
  constructor() {
    super(UserModel, 'User');
  }

  // Domain-specific customization: exclude passwordHash
  override async list(filter = {}, options = {}) {
    const page = Math.max(1, (options as any).page || 1);
    const limit = Math.min(100, Math.max(1, (options as any).limit || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      UserModel.find(filter, { passwordHash: 0 }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  override async getById(id: string) {
    const user = await UserModel.findById(id, { passwordHash: 0 });
    if (!user) {
      throw new Error(`User with ID '${id}' not found`);
    }
    return user;
  }
}

export const usersService = new UsersService();
