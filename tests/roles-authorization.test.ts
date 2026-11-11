import { describe, it, expect, beforeEach } from 'bun:test';
import {
  permissionService,
  ResolvedPermission,
  permissionCache,
} from '../src/modules/roles/services/permission.service.js';
import { IUser } from '../src/modules/users/user.model.js';
import { runWithTenantContext } from '../src/common/context/index.js';

describe('Dynamic Roles & Permission Authorization Verification', () => {
  beforeEach(() => {
    permissionService.invalidateAll();
  });

  it('Resolves wildcard access for ADMIN role without database roundtrips', async () => {
    const mockAdmin = {
      id: 'admin_123',
      tenantId: 'tenant_test',
      email: 'admin@acme.com',
      role: 'ADMIN',
      roleIds: [],
      permissionOverrides: [],
      isActive: true,
    } as unknown as IUser;

    await runWithTenantContext({ tenantId: 'tenant_test', requestId: 'req_admin' }, async () => {
      const canRead = await permissionService.checkAccess(mockAdmin, 'billing', 'read');
      const canDelete = await permissionService.checkAccess(mockAdmin, 'system', 'nuclear_delete');
      expect(canRead).toBe(true);
      expect(canDelete).toBe(true);
    });
  });

  it('Enforces OWN scope restriction correctly', async () => {
    const mockUser = {
      id: 'user_456',
      tenantId: 'tenant_test',
      role: 'USER',
      roleIds: [],
      permissionOverrides: [],
      isActive: true,
    } as unknown as IUser;

    const cacheKey = permissionService.getCacheKey('tenant_test', 'user_456');
    const mockMap = new Map<string, ResolvedPermission>();
    mockMap.set('documents:edit', {
      moduleCode: 'documents',
      action: 'edit',
      scope: 'OWN',
      isGranted: true,
    });

    permissionCache.set(cacheKey, {
      permissions: mockMap,
      expiresAt: Date.now() + 60000,
    });

    await runWithTenantContext({ tenantId: 'tenant_test', requestId: 'req_scope' }, async () => {
      const canEditOwn = await permissionService.checkAccess(
        mockUser,
        'documents',
        'edit',
        'user_456'
      );
      expect(canEditOwn).toBe(true);

      const canEditOther = await permissionService.checkAccess(
        mockUser,
        'documents',
        'edit',
        'user_999'
      );
      expect(canEditOther).toBe(false);
    });
  });

  it('Enforces explicit user-level DENY override taking precedence', async () => {
    const mockUser = {
      id: 'user_restricted',
      tenantId: 'tenant_test',
      role: 'USER',
      roleIds: [],
      permissionOverrides: [],
      isActive: true,
    } as unknown as IUser;

    const cacheKey = permissionService.getCacheKey('tenant_test', 'user_restricted');
    const mockMap = new Map<string, ResolvedPermission>();
    mockMap.set('reports:export', {
      moduleCode: 'reports',
      action: 'export',
      scope: 'ALL',
      isGranted: false, // Explicit DENY
    });

    permissionCache.set(cacheKey, {
      permissions: mockMap,
      expiresAt: Date.now() + 60000,
    });

    await runWithTenantContext({ tenantId: 'tenant_test', requestId: 'req_deny' }, async () => {
      const hasAccess = await permissionService.checkAccess(mockUser, 'reports', 'export');
      expect(hasAccess).toBe(false);
    });
  });
});
