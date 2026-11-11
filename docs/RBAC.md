# Dynamic Multi-Tenant RBAC Architecture & API Specification

This document details the dynamic Role-Based Access Control (RBAC) engine implemented in `backend-mongodb-starter`.

---

## 🏛️ Architecture & Permission Resolution Hierarchy

```
                               ┌────────────────────────┐
                               │  Incoming HTTP Request │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │  authenticate Guard   │
                               │ (JWT + Tenant Context) │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ authorize(module, act) │
                               └───────────┬────────────┘
                                           │
                                           ▼
                        ┌──────────────────────────────────────┐
                        │       PermissionEngine Resolver      │
                        │                                      │
                        │  1. Check Memory/Redis Cache         │
                        │  2. Wildcard Bypass (ADMIN: *.*)     │
                        │  3. Merge Permissions from Role IDs  │
                        │  4. Apply User Overrides (DENY>GRANT)│
                        │  5. Scope Check (ALL, OWN, ASSIGNED) │
                        └──────────────────────────────────────┘
```

---

## 🔒 Permission Precedence & Evaluation Rules

1. **Explicit Denial Priority**: If a user has an explicit `DENY` override on a permission, it overrides **all** grants across all their assigned roles.
2. **Multi-Role Union**: Permissions across multiple roles assigned to a user are unioned.
3. **Scope Hierarchy**:
   - `ALL`: Unrestricted access across the tenant.
   - `OWN`: Granted only when the target resource's `ownerId` matches the authenticated `user.id`.
   - `ASSIGNED`: Granted only when the resource is directly assigned to the user.
   - `CUSTOM`: Evaluates attribute-based conditions defined in `conditions`.
4. **Tenant Isolation**: All modules, roles, and permissions have strict compound indices (`{ tenantId: 1, code: 1 }`). No cross-tenant access is possible.
5. **Caching & Invalidation**: Effective permissions are cached for 60 seconds. Calling any role/permission assignment API instantly invalidates the user's cache.

---

## 📡 REST API Reference (`/api/v1/rbac`)

### 1. Modules Management

- `GET /api/v1/rbac/modules` — List registered system modules & submodules
- `GET /api/v1/rbac/modules/:id` — View module details
- `POST /api/v1/rbac/modules` — Register new module (auto-generates standard CRUD permissions)
- `PATCH /api/v1/rbac/modules/:id` — Update module status or display order
- `DELETE /api/v1/rbac/modules/:id` — Delete module (protected system modules cannot be deleted)

### 2. Permissions Management

- `GET /api/v1/rbac/permissions?moduleCode=...` — List permissions (paginated, filterable by module)
- `POST /api/v1/rbac/permissions` — Create custom permission with scope (`ALL`, `OWN`, `ASSIGNED`, `CUSTOM`)
- `PATCH /api/v1/rbac/permissions/:id/approve` — Approve permission
- `PATCH /api/v1/rbac/permissions/:id/reject` — Reject permission

### 3. Roles Management

- `GET /api/v1/rbac/roles` — List roles (paginated)
- `GET /api/v1/rbac/roles/:id` — Get role details with assigned permissions
- `POST /api/v1/rbac/roles` — Create new role
- `PATCH /api/v1/rbac/roles/:id` — Update role permissions & modules
- `DELETE /api/v1/rbac/roles/:id` — Delete role (protected system roles cannot be deleted)
- `POST /api/v1/rbac/roles/:id/clone` — Clone an existing role into a new role

### 4. User Role & Permission Overrides

- `POST /api/v1/rbac/users/:id/roles` — Assign multiple roles to a user
- `POST /api/v1/rbac/users/:id/permissions` — Assign user-specific `GRANT` or `DENY` overrides
- `GET /api/v1/rbac/auth/me/permissions` — Retrieve currently authenticated user's resolved effective permissions
