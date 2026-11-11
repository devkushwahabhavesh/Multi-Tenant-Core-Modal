import { BaseController } from '../../shared/controllers/base.controller.js';
import { IUser } from './user.model.js';
import { usersService } from './users.service.js';

export class UsersController extends BaseController<IUser> {
  constructor() {
    super(usersService);
  }
}

export const usersController = new UsersController();
