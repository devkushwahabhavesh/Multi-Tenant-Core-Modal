import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i, 'Code must be alphanumeric with underscores'),
    description: z.string().max(500).optional(),
    moduleIds: z.array(z.string()).optional(),
    permissionIds: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i)
      .optional(),
    description: z.string().max(500).optional(),
    moduleIds: z.array(z.string()).optional(),
    permissionIds: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const cloneRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i),
    description: z.string().max(500).optional(),
  }),
});

export const toggleRoleStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const assignRightsSchema = z.object({
  body: z.object({
    rights: z.array(
      z.object({
        moduleCode: z.string().min(1),
        actions: z.array(z.string().min(1)),
        scope: z.enum(['ALL', 'OWN', 'ASSIGNED', 'CUSTOM']).optional(),
      })
    ),
  }),
});

export const assignModulesAndPermissionsSchema = z.object({
  body: z.object({
    moduleIds: z.array(z.string()),
    permissionIds: z.array(z.string()),
  }),
});

export const assignUserRolesSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    roleIds: z.array(z.string()),
  }),
});

export const setUserOverridesSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    overrides: z.array(
      z.object({
        permissionId: z.string().min(1),
        effect: z.enum(['GRANT', 'DENY']),
        scope: z.enum(['ALL', 'OWN', 'ASSIGNED', 'CUSTOM']).optional(),
      })
    ),
  }),
});

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i),
    moduleCode: z.string().min(1).max(50),
    action: z.string().min(1).max(50),
    scope: z.enum(['ALL', 'OWN', 'ASSIGNED', 'CUSTOM']).optional(),
    description: z.string().max(500).optional(),
    conditions: z.record(z.unknown()).optional(),
  }),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i)
      .optional(),
    moduleCode: z.string().min(1).max(50).optional(),
    action: z.string().min(1).max(50).optional(),
    scope: z.enum(['ALL', 'OWN', 'ASSIGNED', 'CUSTOM']).optional(),
    description: z.string().max(500).optional(),
    conditions: z.record(z.unknown()).optional(),
  }),
});

export const importPermissionsSchema = z.object({
  body: z.object({
    permissions: z.array(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        moduleCode: z.string().min(1),
        action: z.string().min(1),
        scope: z.enum(['ALL', 'OWN', 'ASSIGNED', 'CUSTOM']).optional(),
        description: z.string().optional(),
        conditions: z.record(z.unknown()).optional(),
      })
    ),
  }),
});

export const createModuleMenuSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i),
    path: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().int().optional(),
    parentId: z.string().nullable().optional(),
    isMenu: z.boolean().optional(),
    isActive: z.boolean().optional(),
    description: z.string().max(500).optional(),
  }),
});

export const updateModuleMenuSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i)
      .optional(),
    path: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().int().optional(),
    parentId: z.string().nullable().optional(),
    isMenu: z.boolean().optional(),
    isActive: z.boolean().optional(),
    description: z.string().max(500).optional(),
  }),
});
