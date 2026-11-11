import { Router } from 'express';
import { RouteDefinition, buildRoutes } from '../../middleware/route-builder.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import { sensitiveLimiter } from '../../../middleware/rate-limiter.js';
import { roleController } from '../controllers/role.controller.js';
import { permissionController } from '../controllers/permission.controller.js';
import { moduleMenuController } from '../controllers/module-menu.controller.js';
import {
  createRoleSchema,
  updateRoleSchema,
  cloneRoleSchema,
  toggleRoleStatusSchema,
  assignRightsSchema,
  assignModulesAndPermissionsSchema,
  assignUserRolesSchema,
  setUserOverridesSchema,
  createPermissionSchema,
  updatePermissionSchema,
  importPermissionsSchema,
  createModuleMenuSchema,
  updateModuleMenuSchema,
} from '../validations/role.validation.js';

const router = Router();

const roleRoutes: RouteDefinition[] = [
  // --- Modules & Menus ---
  {
    method: 'get',
    path: '/modules/tree',
    middleware: [authenticate, authorize('modules', 'read')],
    handler: moduleMenuController.handleGetTree,
  },
  {
    method: 'get',
    path: '/modules',
    middleware: [authenticate, authorize('modules', 'read')],
    handler: moduleMenuController.handleList,
  },
  {
    method: 'get',
    path: '/modules/:id',
    middleware: [authenticate, authorize('modules', 'read')],
    handler: moduleMenuController.handleGetById,
  },
  {
    method: 'post',
    path: '/modules',
    middleware: [authenticate, authorize('modules', 'create'), validate(createModuleMenuSchema)],
    handler: moduleMenuController.handleCreate,
  },
  {
    method: 'put',
    path: '/modules/:id',
    middleware: [authenticate, authorize('modules', 'update'), validate(updateModuleMenuSchema)],
    handler: moduleMenuController.handleUpdate,
  },
  {
    method: 'delete',
    path: '/modules/:id',
    middleware: [authenticate, authorize('modules', 'delete'), sensitiveLimiter],
    handler: moduleMenuController.handleDelete,
  },

  // --- Permissions Management ---
  {
    method: 'get',
    path: '/permissions/actions/export',
    middleware: [authenticate, authorize('permissions', 'export')],
    handler: permissionController.handleExport,
  },
  {
    method: 'post',
    path: '/permissions/actions/import',
    middleware: [
      authenticate,
      authorize('permissions', 'import'),
      validate(importPermissionsSchema),
    ],
    handler: permissionController.handleImport,
  },
  {
    method: 'get',
    path: '/permissions',
    middleware: [authenticate, authorize('permissions', 'read')],
    handler: permissionController.handleList,
  },
  {
    method: 'get',
    path: '/permissions/:id',
    middleware: [authenticate, authorize('permissions', 'read')],
    handler: permissionController.handleGetById,
  },
  {
    method: 'post',
    path: '/permissions',
    middleware: [
      authenticate,
      authorize('permissions', 'create'),
      validate(createPermissionSchema),
    ],
    handler: permissionController.handleCreate,
  },
  {
    method: 'put',
    path: '/permissions/:id',
    middleware: [
      authenticate,
      authorize('permissions', 'update'),
      validate(updatePermissionSchema),
    ],
    handler: permissionController.handleUpdate,
  },
  {
    method: 'delete',
    path: '/permissions/:id',
    middleware: [authenticate, authorize('permissions', 'delete'), sensitiveLimiter],
    handler: permissionController.handleDelete,
  },
  {
    method: 'patch',
    path: '/permissions/:id/approve',
    middleware: [authenticate, authorize('permissions', 'approve'), sensitiveLimiter],
    handler: permissionController.handleApprove,
  },
  {
    method: 'patch',
    path: '/permissions/:id/reject',
    middleware: [authenticate, authorize('permissions', 'approve'), sensitiveLimiter],
    handler: permissionController.handleReject,
  },

  // --- Role Assignments & Overrides ---
  {
    method: 'post',
    path: '/roles/assignments/user',
    middleware: [authenticate, authorize('roles', 'assign_user'), validate(assignUserRolesSchema)],
    handler: roleController.handleAssignUserRoles,
  },
  {
    method: 'post',
    path: '/roles/overrides/user',
    middleware: [authenticate, authorize('roles', 'assign_user'), validate(setUserOverridesSchema)],
    handler: roleController.handleSetUserOverrides,
  },

  // --- Roles Management ---
  {
    method: 'get',
    path: '/roles',
    middleware: [authenticate, authorize('roles', 'read')],
    handler: roleController.handleList,
  },
  {
    method: 'get',
    path: '/roles/:id',
    middleware: [authenticate, authorize('roles', 'read')],
    handler: roleController.handleGetById,
  },
  {
    method: 'post',
    path: '/roles',
    middleware: [authenticate, authorize('roles', 'create'), validate(createRoleSchema)],
    handler: roleController.handleCreate,
  },
  {
    method: 'put',
    path: '/roles/:id',
    middleware: [authenticate, authorize('roles', 'update'), validate(updateRoleSchema)],
    handler: roleController.handleUpdate,
  },
  {
    method: 'delete',
    path: '/roles/:id',
    middleware: [authenticate, authorize('roles', 'delete'), sensitiveLimiter],
    handler: roleController.handleDelete,
  },
  {
    method: 'post',
    path: '/roles/:id/clone',
    middleware: [authenticate, authorize('roles', 'create'), validate(cloneRoleSchema)],
    handler: roleController.handleClone,
  },
  {
    method: 'patch',
    path: '/roles/:id/status',
    middleware: [authenticate, authorize('roles', 'update'), validate(toggleRoleStatusSchema)],
    handler: roleController.handleToggleStatus,
  },
  {
    method: 'post',
    path: '/roles/:id/rights',
    middleware: [
      authenticate,
      authorize('roles', 'manage_permissions'),
      validate(assignRightsSchema),
    ],
    handler: roleController.handleAssignRights,
  },
  {
    method: 'post',
    path: '/roles/:id/assignments',
    middleware: [
      authenticate,
      authorize('roles', 'manage_permissions'),
      validate(assignModulesAndPermissionsSchema),
    ],
    handler: roleController.handleAssignModulesAndPermissions,
  },
];

export const rolesRouter = buildRoutes(router, roleRoutes);
