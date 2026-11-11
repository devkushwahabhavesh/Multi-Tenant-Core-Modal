import { getTenantId } from '../../../common/context/index.js';
import {
  roleBaseController,
  permissionBaseController,
} from '../controllers/base-roles.controllers.js';
import { IPermission, PermissionScope, PermissionModel } from '../models/permission.model.js';
import { IUser } from '../../users/user.model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors/index.js';

export interface ResolvedPermission {
  moduleCode: string;
  action: string;
  scope: PermissionScope;
  isGranted: boolean;
  conditions?: Record<string, unknown>;
}

interface CacheEntry {
  permissions: Map<string, ResolvedPermission>;
  expiresAt: number;
}

export const permissionCache = new Map<string, CacheEntry>();

export class PermissionService {
  private readonly ttlMs: number;

  constructor(
    private readonly roleController = roleBaseController,
    private readonly permissionController = permissionBaseController,
    ttlMs = 60 * 1000 // 1 minute default TTL
  ) {
    this.ttlMs = ttlMs;
  }

  public getCacheKey(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }

  public invalidateUserCache(userId: string, tenantId = getTenantId()): void {
    const key = this.getCacheKey(tenantId, userId);
    permissionCache.delete(key);
  }

  public invalidateAll(): void {
    permissionCache.clear();
  }

  /**
   * Dynamically resolves all active permissions for a user across roles and personal overrides.
   */
  public async resolveUserPermissions(user: IUser): Promise<Map<string, ResolvedPermission>> {
    const tenantId = getTenantId();
    const cacheKey = this.getCacheKey(tenantId, user.id);

    const cached = permissionCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.permissions;
    }

    const permissionMap = new Map<string, ResolvedPermission>();

    // 1. Resolve Permissions from Assigned Roles
    const roleIds = user.roleIds || [];
    let roles: any[] = [];
    if (roleIds.length > 0) {
      const res = await this.roleController.findAll(
        { _id: { $in: roleIds } as any, isActive: true },
        { limit: 100 }
      );
      roles = res.items;
    }

    const allPermissionIds = new Set<string>();
    for (const role of roles) {
      for (const pId of role.permissionIds || []) {
        allPermissionIds.add(pId);
      }
    }

    if (allPermissionIds.size > 0) {
      const permsResult = await this.permissionController.findAll(
        {
          _id: { $in: Array.from(allPermissionIds) } as any,
          status: 'APPROVED',
        },
        { limit: 500 }
      );

      for (const perm of permsResult.items) {
        const key = `${perm.moduleCode.toLowerCase()}:${perm.action.toLowerCase()}`;
        permissionMap.set(key, {
          moduleCode: perm.moduleCode.toLowerCase(),
          action: perm.action.toLowerCase(),
          scope: perm.scope,
          isGranted: true,
          conditions: perm.conditions,
        });
      }
    }

    // Role-based wildcard check for root ADMIN role
    if (user.role === 'ADMIN') {
      permissionMap.set('*.*', {
        moduleCode: '*',
        action: '*',
        scope: 'ALL',
        isGranted: true,
      });
    }

    // 2. Apply User-Specific Permission Overrides (Explicit DENY beats grants)
    if (user.permissionOverrides && user.permissionOverrides.length > 0) {
      const overrideIds = user.permissionOverrides.map((o) => o.permissionId);
      const overridePerms = await this.permissionController.findAll(
        { _id: { $in: overrideIds } as any },
        { limit: 100 }
      );

      const permLookup = new Map<string, IPermission>();
      for (const p of overridePerms.items) {
        permLookup.set(p.id, p);
      }

      for (const override of user.permissionOverrides) {
        const perm = permLookup.get(override.permissionId);
        if (!perm) continue;

        const key = `${perm.moduleCode.toLowerCase()}:${perm.action.toLowerCase()}`;

        if (override.effect === 'DENY') {
          permissionMap.set(key, {
            moduleCode: perm.moduleCode.toLowerCase(),
            action: perm.action.toLowerCase(),
            scope: perm.scope,
            isGranted: false,
          });
        } else if (override.effect === 'GRANT') {
          permissionMap.set(key, {
            moduleCode: perm.moduleCode.toLowerCase(),
            action: perm.action.toLowerCase(),
            scope: override.scope || perm.scope,
            isGranted: true,
          });
        }
      }
    }

    // Cache the resolved permission map
    permissionCache.set(cacheKey, {
      permissions: permissionMap,
      expiresAt: Date.now() + this.ttlMs,
    });

    return permissionMap;
  }

  /**
   * Checks access dynamically for module and action, considering scopes ('ALL', 'OWN', 'ASSIGNED', 'CUSTOM').
   */
  public async checkAccess(
    user: IUser,
    moduleCode: string,
    action: string,
    resourceOwnerId?: string
  ): Promise<boolean> {
    const permissions = await this.resolveUserPermissions(user);

    if (permissions.get('*.*')?.isGranted) {
      return true;
    }

    const key = `${moduleCode.toLowerCase()}:${action.toLowerCase()}`;
    const perm = permissions.get(key);

    if (!perm || !perm.isGranted) {
      return false;
    }

    if (perm.scope === 'ALL') {
      return true;
    }

    if (perm.scope === 'OWN' || perm.scope === 'ASSIGNED') {
      return !!resourceOwnerId && resourceOwnerId === user.id;
    }

    return true;
  }

  public async approvePermission(id: string): Promise<IPermission> {
    const updated = await this.permissionController.update(id, { status: 'APPROVED' } as any);
    this.invalidateAll();
    return updated;
  }

  public async rejectPermission(id: string): Promise<IPermission> {
    const updated = await this.permissionController.update(id, { status: 'REJECTED' } as any);
    this.invalidateAll();
    return updated;
  }

  public async exportPermissions(): Promise<IPermission[]> {
    const res = await this.permissionController.findAll({}, { limit: 1000 });
    return res.items;
  }

  public async importPermissions(
    permissions: Partial<IPermission>[]
  ): Promise<{ imported: number }> {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new BadRequestError('Permissions array cannot be empty');
    }
    const tenantId = getTenantId();
    let imported = 0;
    for (const p of permissions) {
      if (!p.name || !p.code || !p.moduleCode || !p.action) continue;
      await PermissionModel.findOneAndUpdate(
        { tenantId, code: p.code.toUpperCase() },
        { ...p, tenantId, code: p.code.toUpperCase(), status: p.status || 'APPROVED' },
        { upsert: true, new: true }
      );
      imported++;
    }
    this.invalidateAll();
    return { imported };
  }
}

export const permissionService = new PermissionService();
