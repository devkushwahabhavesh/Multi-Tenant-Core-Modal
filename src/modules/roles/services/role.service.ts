import {
  roleBaseController,
  permissionBaseController,
  moduleMenuBaseController,
} from '../controllers/base-roles.controllers.js';
import { IRole } from '../models/role.model.js';
import { userController } from '../../users/user.controller.js';
import { IUser, IUserOverride } from '../../users/user.model.js';
import { permissionService } from './permission.service.js';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../../common/errors/index.js';

export interface DynamicModuleRights {
  moduleCode: string;
  actions: string[];
  scope?: 'ALL' | 'OWN' | 'ASSIGNED' | 'CUSTOM';
}

export class RoleService {
  constructor(
    private readonly roleController = roleBaseController,
    private readonly permissionController = permissionBaseController,
    private readonly moduleController = moduleMenuBaseController,
    private readonly userCtrl = userController,
    private readonly permService = permissionService
  ) {}

  public async createRole(data: Partial<IRole>): Promise<IRole> {
    const existing = await this.roleController.findOne({ code: data.code?.toUpperCase() });
    if (existing) {
      throw new ConflictError(`Role with code '${data.code}' already exists`);
    }

    return this.roleController.create({
      ...data,
      code: data.code!.toUpperCase(),
      moduleIds: data.moduleIds || [],
      permissionIds: data.permissionIds || [],
      isSystem: false,
      isActive: data.isActive !== undefined ? data.isActive : true,
    } as any);
  }

  public async updateRole(id: string, updates: Partial<IRole>): Promise<IRole> {
    const role = await this.roleController.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }

    if (role.isSystem && updates.code && updates.code.toUpperCase() !== role.code) {
      throw new ForbiddenError('Cannot change code for protected system role');
    }

    const updated = await this.roleController.update(id, updates);
    this.permService.invalidateAll();
    return updated;
  }

  public async deleteRole(id: string): Promise<boolean> {
    const role = await this.roleController.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }
    if (role.isSystem) {
      throw new ForbiddenError('Cannot delete protected system role');
    }

    await this.roleController.delete(id);
    this.permService.invalidateAll();
    return true;
  }

  public async cloneRole(
    sourceRoleId: string,
    newRoleData: { name: string; code: string; description?: string }
  ): Promise<IRole> {
    const sourceRole = await this.roleController.findById(sourceRoleId);
    if (!sourceRole) {
      throw new NotFoundError('Source Role', sourceRoleId);
    }

    return this.createRole({
      name: newRoleData.name,
      code: newRoleData.code,
      description: newRoleData.description || `Cloned from ${sourceRole.name}`,
      moduleIds: [...(sourceRole.moduleIds || [])],
      permissionIds: [...(sourceRole.permissionIds || [])],
      isActive: true,
      isDefault: false,
    });
  }

  public async toggleStatus(id: string, isActive: boolean): Promise<IRole> {
    const role = await this.roleController.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }
    if (role.isSystem && !isActive) {
      throw new ForbiddenError('Cannot deactivate protected system role');
    }

    const updated = await this.roleController.update(id, { isActive } as any);
    this.permService.invalidateAll();
    return updated;
  }

  public async assignModulesAndPermissions(
    roleId: string,
    moduleIds: string[],
    permissionIds: string[]
  ): Promise<IRole> {
    const role = await this.roleController.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role', roleId);
    }

    const updated = await this.roleController.update(roleId, {
      moduleIds: Array.from(new Set(moduleIds)),
      permissionIds: Array.from(new Set(permissionIds)),
    } as any);

    this.permService.invalidateAll();
    return updated;
  }

  /**
   * Fully dynamic module-wise and action-wise rights assignment.
   * Finds matching permissions for the requested moduleCode and actions, and binds them to the role.
   */
  public async assignDynamicRights(roleId: string, rights: DynamicModuleRights[]): Promise<IRole> {
    const role = await this.roleController.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role', roleId);
    }

    const targetPermissionIds = new Set<string>(role.permissionIds || []);
    const targetModuleIds = new Set<string>(role.moduleIds || []);

    for (const item of rights) {
      const moduleCode = item.moduleCode.toLowerCase();
      // Find module by code to attach to moduleIds
      const mod = await this.moduleController.findOne({ code: item.moduleCode.toUpperCase() });
      if (mod) {
        targetModuleIds.add(mod.id);
      }

      // Find permissions matching moduleCode and the specified actions
      const perms = await this.permissionController.findAll(
        {
          moduleCode,
          action: { $in: item.actions.map((a) => a.toLowerCase()) } as any,
          status: 'APPROVED',
        },
        { limit: 100 }
      );

      for (const p of perms.items) {
        targetPermissionIds.add(p.id);
      }
    }

    const updated = await this.roleController.update(roleId, {
      moduleIds: Array.from(targetModuleIds),
      permissionIds: Array.from(targetPermissionIds),
    } as any);

    this.permService.invalidateAll();
    return updated;
  }

  public async assignUserRoles(userId: string, roleIds: string[]): Promise<IUser> {
    const user = await this.userCtrl.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Verify all roles exist
    const rolesResult = await this.roleController.findAll(
      {
        _id: { $in: roleIds } as any,
        isActive: true,
      },
      { limit: 100 }
    );

    if (rolesResult.items.length !== roleIds.length) {
      throw new BadRequestError('One or more specified roles do not exist or are inactive');
    }

    const updated = await this.userCtrl.update(userId, { roleIds } as any);
    this.permService.invalidateUserCache(userId);
    return updated;
  }

  public async setUserPermissionOverrides(
    userId: string,
    overrides: IUserOverride[]
  ): Promise<IUser> {
    const user = await this.userCtrl.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const updated = await this.userCtrl.update(userId, { permissionOverrides: overrides } as any);
    this.permService.invalidateUserCache(userId);
    return updated;
  }
}

export const roleService = new RoleService();
