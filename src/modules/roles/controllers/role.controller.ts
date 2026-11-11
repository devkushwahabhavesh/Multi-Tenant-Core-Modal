import { Request, Response } from 'express';
import { BaseController } from '../../../common/controllers/base.controller.js';
import { RoleModel, IRole } from '../models/role.model.js';
import { roleService, RoleService } from '../services/role.service.js';
import { sendSuccess } from '../../../common/utils/response.js';

export class RoleController extends BaseController<IRole> {
  constructor(private readonly service: RoleService = roleService) {
    super(RoleModel, 'Role');
  }

  public override handleCreate = async (req: Request, res: Response): Promise<Response> => {
    const role = await this.service.createRole(req.body);
    return sendSuccess(res, role, 201);
  };

  public override handleUpdate = async (req: Request, res: Response): Promise<Response> => {
    const updated = await this.service.updateRole(req.params.id, req.body);
    return sendSuccess(res, updated);
  };

  public override handleDelete = async (req: Request, res: Response): Promise<Response> => {
    await this.service.deleteRole(req.params.id);
    return sendSuccess(res, { id: req.params.id, deleted: true });
  };

  public handleClone = async (req: Request, res: Response): Promise<Response> => {
    const cloned = await this.service.cloneRole(req.params.id, req.body);
    return sendSuccess(res, cloned, 201);
  };

  public handleToggleStatus = async (req: Request, res: Response): Promise<Response> => {
    const { isActive } = req.body;
    const updated = await this.service.toggleStatus(req.params.id, isActive);
    return sendSuccess(res, updated);
  };

  public handleAssignRights = async (req: Request, res: Response): Promise<Response> => {
    const { rights } = req.body;
    const updated = await this.service.assignDynamicRights(req.params.id, rights);
    return sendSuccess(res, updated);
  };

  public handleAssignModulesAndPermissions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { moduleIds, permissionIds } = req.body;
    const updated = await this.service.assignModulesAndPermissions(
      req.params.id,
      moduleIds,
      permissionIds
    );
    return sendSuccess(res, updated);
  };

  public handleAssignUserRoles = async (req: Request, res: Response): Promise<Response> => {
    const { userId, roleIds } = req.body;
    const updatedUser = await this.service.assignUserRoles(userId, roleIds);
    return sendSuccess(res, { userId: updatedUser.id, roleIds: updatedUser.roleIds });
  };

  public handleSetUserOverrides = async (req: Request, res: Response): Promise<Response> => {
    const { userId, overrides } = req.body;
    const updatedUser = await this.service.setUserPermissionOverrides(userId, overrides);
    return sendSuccess(res, { userId: updatedUser.id, overrides: updatedUser.permissionOverrides });
  };
}

export const roleController = new RoleController();
