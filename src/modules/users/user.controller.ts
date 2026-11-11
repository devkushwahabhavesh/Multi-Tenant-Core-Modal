import { Request, Response } from 'express';
import { BaseController } from '../../common/controllers/base.controller.js';
import { UserModel, IUser } from './user.model.js';
import { sendSuccess } from '../../common/utils/response.js';

export class UserController extends BaseController<IUser> {
  constructor() {
    super(UserModel, 'User');
  }

  // Override handleList to support search, role filter, and strip sensitive fields
  public override handleList = async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await this.findAll(filter, { page, limit });
    const sanitizedItems = result.items.map(({ passwordHash, refreshTokens, ...rest }) => rest);

    return sendSuccess(res, sanitizedItems, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  };

  // Override handleGetById to strip sensitive password and tokens
  public override handleGetById = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.findById(req.params.id);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { passwordHash, refreshTokens, ...sanitized } = userObj;
    return sendSuccess(res, sanitized);
  };

  // Override handleUpdate to sanitize returned object
  public override handleUpdate = async (req: Request, res: Response): Promise<Response> => {
    const updated = await this.update(req.params.id, req.body);
    const updatedObj = (updated as any).toObject ? (updated as any).toObject() : updated;
    const { passwordHash, refreshTokens, ...sanitized } = updatedObj;
    return sendSuccess(res, sanitized);
  };

  // Custom controller action: soft-deactivate
  public handleDeactivate = async (req: Request, res: Response): Promise<Response> => {
    await this.update(req.params.id, { isActive: false });
    return sendSuccess(res, { id: req.params.id, deactivated: true });
  };
}

export const userController = new UserController();
