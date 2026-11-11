# Express.js + MongoDB (Mongoose) Modular Monolith Starter

A production-grade, highly scalable **Modular Monolith** backend package built with **Node.js, Express.js, TypeScript, Mongoose (MongoDB), and Zod**.

---

## 🏛️ Architecture & Separation of Concerns

This codebase avoids unnecessary repository abstractions and over-engineering by leveraging **Mongoose Models directly within domain Services**, keeping code clean, readable, and idiomatic to MongoDB.

```
                              ┌─────────────────────────┐
                              │     HTTP Request In     │
                              └────────────┬────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │    Shared Middleware    │
                              │ (Validate, Auth, Cors)  │
                              └────────────┬────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            Feature Modules (Slice)           │
                    │                                              │
                    │  [routes] ──> [controller] ──> [service]     │
                    │                                   │          │
                    │                                   ▼          │
                    │                             [Mongoose Model] │
                    └──────────────────────────────────────────────┘
```

---

## 🌟 Key Highlights

1. **Feature-First Standardized Module Layout**:
   - `[name].model.ts`: Mongoose schema, indexes, and typed document interface.
   - `[name].schemas.ts`: Zod validation schemas for request bodies, queries, and URL params.
   - `[name].service.ts`: Direct Mongoose queries and business logic (no repository indirection).
   - `[name].controller.ts`: Thin request parser and response dispatcher.
   - `[name].routes.ts`: Express routes with validation middleware attached.

2. **⚡ One-Command Module Generator**:
   Scaffold complete, strongly-typed CRUD modules with zero boilerplate:
   ```bash
   bun run make:module products
   # or
   npm run make:module products
   ```

3. **Mongoose-Aware Error Handler**:
   - Handles Mongoose duplicate key errors (`code 11000`).
   - Formats `ValidationError` and `CastError` (invalid ObjectId).
   - Uniform `{ success, data, error, meta }` response envelope.

4. **Security & Production Utilities**:
   - JWT authentication (`authenticate`) and role-based access (`authorize`).
   - Helmet, CORS, and Morgan preconfigured.

---

## 📁 Directory Structure

```
backend-mongodb-starter/
├── package.json                          # Package definition & scripts (dev, build, test, make:module)
├── tsconfig.json                         # Strict TypeScript NodeNext
├── .env.example & .env                   # Environment variables
├── README.md                             # Documentation
│
├── bin/
│   └── make-module.ts                    # ⚡ One-Command CLI Module Generator
│
├── src/
│   ├── index.ts                          # Server bootstrap & DB connection
│   ├── app.ts                            # Express application setup
│   ├── router.ts                         # Dynamic module route registry
│   │
│   ├── config/
│   │   └── env.ts                        # Strongly typed configuration
│   │
│   ├── core/                             # 🧠 Pure Domain Logic
│   │   ├── errors.ts                     # AppError hierarchy (NotFoundError, UnauthorizedError, etc.)
│   │   ├── result.ts                     # Functional Result<T, E> monad
│   │   └── index.ts                      # Barrel export
│   │
│   ├── shared/                           # 🔧 Cross-Cutting Infrastructure
│   │   ├── database/
│   │   │   ├── connection.ts             # Mongoose connection & lifecycle manager
│   │   │   └── base.schema.ts            # Base schema options (timestamps, id transform, clean JSON)
│   │   ├── middleware/
│   │   │   ├── auth.ts                   # JWT authentication & authorize RBAC guard
│   │   │   ├── validate.ts               # Zod request validation middleware
│   │   │   ├── error-handler.ts          # Global exception handler & Mongoose error parser
│   │   │   └── async-handler.ts          # Async route wrapper
│   │   └── utils/
│   │       ├── jwt.ts                    # JWT sign & verify utilities
│   │       └── response.ts               # Uniform API response envelope
│   │
│   └── modules/                          # 📦 Feature Vertical Slices
│       ├── _template/                    # Template blueprint
│       │   ├── _template.routes.ts
│       │   └── README.md
│       ├── auth/                         # Authentication (Register, Login, Me)
│       │   ├── auth.schemas.ts
│       │   ├── auth.service.ts
│       │   └── auth.routes.ts
│       └── users/                        # User management & queries
│           ├── user.model.ts
│           ├── users.service.ts
│           └── users.routes.ts
└── tests/
    └── core.test.ts                      # Automated unit test suite
```

---

## 🚀 Quick Start Guide

### 1. Install & Build
```bash
bun install
bun run build
```

### 2. Scaffold a New Feature
```bash
bun run make:module orders
```
Register the generated router in `src/router.ts`:
```typescript
import { ordersRouter } from './modules/orders/orders.routes.js';

router.use('/orders', ordersRouter);
```

### 3. Start Development Server
```bash
bun run dev
```
Healthcheck: `http://localhost:5000/api/v1/health`
