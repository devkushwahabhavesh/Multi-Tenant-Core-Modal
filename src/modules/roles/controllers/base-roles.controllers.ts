import { BaseController } from '../../../common/controllers/base.controller.js';
import { ModuleMenuModel, IModuleMenu } from '../models/module-menu.model.js';
import { PermissionModel, IPermission } from '../models/permission.model.js';
import { RoleModel, IRole } from '../models/role.model.js';

export const moduleMenuBaseController = new BaseController<IModuleMenu>(
  ModuleMenuModel,
  'ModuleMenu'
);
export const permissionBaseController = new BaseController<IPermission>(
  PermissionModel,
  'Permission'
);
export const roleBaseController = new BaseController<IRole>(RoleModel, 'Role');
