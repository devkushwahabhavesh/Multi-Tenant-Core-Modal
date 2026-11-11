# Codebase Naming Conventions & Structural Standards

This document establishes the official naming and architecture standards for all backend services in this repository.

---

## 1. Golden Rule

> **Every name must communicate its actual responsibility.**  
> Prefer simple, industry-standard, predictable terminology over decorative or vague names. Consistency is strictly enforced across all modules.

---

## 2. File & Directory Naming Standards

| Element         | Format                   | Example                                             | Responsibility                                     |
| --------------- | ------------------------ | --------------------------------------------------- | -------------------------------------------------- |
| **Directories** | `kebab-case`             | `src/modules/rbac`, `src/shared/database`           | Houses cohesive functional domains                 |
| **Model**       | `[entity].model.ts`      | `user.model.ts`, `role.model.ts`                    | Mongoose document interface, schema & indexes      |
| **Repository**  | `[entity].repository.ts` | `user.repository.ts`, `audit.repository.ts`         | Database queries, isolation filters, and mutations |
| **Validation**  | `[entity].validation.ts` | `auth.validation.ts`, `user.validation.ts`          | Zod validation rules for HTTP requests             |
| **Service**     | `[entity].service.ts`    | `auth.service.ts`, `user.service.ts`                | Pure business logic and domain operations          |
| **Controller**  | `[entity].controller.ts` | `auth.controller.ts`, `user.controller.ts`          | Request extraction and response dispatching        |
| **Routes**      | `[entity].routes.ts`     | `auth.routes.ts`, `user.routes.ts`                  | Declarative array route definitions                |
| **Middleware**  | `kebab-case.ts`          | `error-handler.ts`, `route-builder.ts`, `tenant.ts` | Express middleware hooks                           |

---

## 3. Code Identifiers & Casing Rules

- **Classes & Types**: `PascalCase` (`AppError`, `RbacService`, `BaseRepository`, `IUser`).
- **Functions & Methods**: `camelCase` (`getUserById`, `resolveUserPermissions`, `createBaseRepository`).
- **Variables & Object Keys**: `camelCase` (`tenantId`, `actorEmail`, `permissionMap`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` (`DEFAULT_TENANT_ID`, `JWT_SECRET`, `TTL_MS`).
- **REST Endpoints**: Plural kebab-case resource nouns (`/api/v1/users`, `/api/v1/rbac/modules`).

---

## 4. Standard Module Internal Layout

Every feature module inside `src/modules/[module-name]/` follows this standardized blueprint:

```
src/modules/[module-name]/
├── [entity].model.ts         # Singular entity model & schema
├── [entity].repository.ts    # Entity repository wrapping BaseRepository
├── [entity].validation.ts    # Zod validation schemas
├── [entity].service.ts       # Domain service logic
├── [entity].controller.ts    # HTTP controller handlers
└── [entity].routes.ts        # Declarative route array exported to router.ts
```

---

## 5. What Was Audited & Fixed in Phase 3

1. **Singularized Module Files**:
   - `users.controller.ts` $\rightarrow$ `user.controller.ts`
   - `users.service.ts` $\rightarrow$ `user.service.ts`
   - `users.routes.ts` $\rightarrow$ `user.routes.ts`
2. **Schema Terminology Standardized**:
   - `base.schema.ts` $\rightarrow$ `base.model.ts`
   - `auth.schemas.ts` $\rightarrow$ `auth.validation.ts`
   - `rbac.schemas.ts` $\rightarrow$ `rbac.validation.ts`
3. **Redundant Code Eliminated**:
   - Removed orphaned `connection.ts` in favor of centralized `connection-pool.ts`.
   - Renamed `tenant.middleware.ts` to `tenant.ts` to match standard middleware naming.
