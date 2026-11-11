# Enterprise Modular Monolith: Express + MongoDB Architecture Starter

A production-grade, architectural boilerplate featuring a **BFF (Backend-For-Frontend) separation** where Mobile and Web application APIs are isolated into dedicated gateways while sharing a pure, reusable Domain Layer.

---

## ðŸ›ï¸ Architecture & Separation of Concerns

```
                                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                 â”‚ HTTP Requests  â”‚
                                 â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                         â”‚
                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                   â–¼                     â–¼                     â–¼
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚  /api/v1/mobile â”‚   â”‚   /api/v1/web   â”‚   â”‚  /api/v1/common â”‚
          â”‚ (Mobile Gateway)â”‚   â”‚  (Web Gateway)  â”‚   â”‚(Shared Profile) â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚                     â”‚                     â”‚
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                         â–¼
                            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                            â”‚      Domain Layer      â”‚
                            â”‚ (Auth, Users, Entities)â”‚
                            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                         â”‚
                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                   â–¼                                           â–¼
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â”‚   MongoDB / Mongoose   â”‚                 â”‚   In-Memory EventBus   â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1. Presentation Gateways (`src/api/v1/`)
- **`mobile/`**: Optimized for mobile networks (iOS & Android). Handles device telemetry, FCM push token syncing, and lightweight bootstrap payloads.
- **`web/`**: Tailored for desktop web apps and admin portals. Supports multi-field queries, pagination, management tables, and system health metrics.
- **`common/`**: Universal endpoints like user profile management and session inspection.

### 2. Pure Domain Layer (`src/domain/`)
- Houses models, services, and core business rules completely decoupled from HTTP transport.
- Services can be invoked by HTTP controllers, background workers, or CLI scripts.
- Includes a ready-to-copy `_template/` blueprint to scaffold new business modules in seconds.

### 3. Infrastructure & Shared Core (`src/infrastructure/` & `src/shared/`)
- **Database**: Mongoose connection management with auto-indexing and sanitized base schemas (`id` virtual, strip `_id` & `__v`).
- **Event Bus**: In-process domain event bus (`eventBus.publish()`, `eventBus.subscribe()`) for asynchronous decoupling.
- **Middleware**: Zod request validator, JWT authentication, role-based authorization (`ADMIN`, `MANAGER`, `USER`), and a global Mongoose error parser (handles 11000 duplicate keys, CastErrors, etc.).

---

## ðŸ“‚ Directory Layout

```
backend-mongodb-starter/
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ .env.example
â”œâ”€â”€ .env
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ index.ts                           # App bootstrap & DB connection
â”‚   â”œâ”€â”€ app.ts                             # Express setup, security & middleware
â”‚   â”œâ”€â”€ router.ts                          # Mounts /mobile, /web, and /common
â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â””â”€â”€ env.ts                         # Strongly typed environment config
â”‚   â”œâ”€â”€ core/
â”‚   â”‚   â””â”€â”€ errors.ts                      # AppError, NotFoundError, ConflictError, etc.
â”‚   â”œâ”€â”€ domain/                            # Reusable Core Business Logic
â”‚   â”‚   â”œâ”€â”€ _template/                     # Blueprint for new domain entities
â”‚   â”‚   â”œâ”€â”€ auth/                          # Authentication domain service
â”‚   â”‚   â”‚   â””â”€â”€ auth.service.ts
â”‚   â”‚   â””â”€â”€ users/                         # User domain model & service
â”‚   â”‚       â”œâ”€â”€ user.model.ts              # Device sessions, profiles, and roles
â”‚   â”‚       â””â”€â”€ user.service.ts
â”‚   â”œâ”€â”€ api/v1/                            # Client-Specific Gateways (BFF)
â”‚   â”‚   â”œâ”€â”€ mobile/                        # Mobile-optimized endpoints & telemetry
â”‚   â”‚   â”‚   â”œâ”€â”€ mobile.schemas.ts
â”‚   â”‚   â”‚   â””â”€â”€ mobile.routes.ts
â”‚   â”‚   â”œâ”€â”€ web/                           # Web portal & admin endpoints
â”‚   â”‚   â”‚   â”œâ”€â”€ web.schemas.ts
â”‚   â”‚   â”‚   â””â”€â”€ web.routes.ts
â”‚   â”‚   â””â”€â”€ common/                        # Shared profile endpoints
â”‚   â”‚       â””â”€â”€ common.routes.ts
â”‚   â”œâ”€â”€ infrastructure/                    # External Drivers & Adapters
â”‚   â”‚   â”œâ”€â”€ database/
â”‚   â”‚   â”‚   â””â”€â”€ connection.ts              # Mongoose connection & lifecycle
â”‚   â”‚   â”œâ”€â”€ events/
â”‚   â”‚   â”‚   â””â”€â”€ event-bus.ts               # Domain event emitter
â”‚   â”‚   â””â”€â”€ logger/
â”‚   â”‚       â””â”€â”€ logger.ts                  # Structured logging utility
â”‚   â””â”€â”€ shared/                            # Cross-Cutting Concerns
â”‚       â”œâ”€â”€ database/
â”‚       â”‚   â””â”€â”€ base.schema.ts             # Base schema options
â”‚       â”œâ”€â”€ middleware/
â”‚       â”‚   â”œâ”€â”€ auth.ts                    # authenticate & authorize
â”‚       â”‚   â”œâ”€â”€ validate.ts                # Zod request validator
â”‚       â”‚   â”œâ”€â”€ error-handler.ts           # Global error handler
â”‚       â”‚   â””â”€â”€ async-handler.ts           # Async try/catch wrapper
â”‚       â””â”€â”€ utils/
â”‚           â”œâ”€â”€ jwt.ts                     # JWT sign/verify
â”‚           â””â”€â”€ response.ts                # Standard API response envelope
â””â”€â”€ tests/
    â””â”€â”€ core.test.ts                       # Unit & integration tests
```

---

## ðŸš€ Quick Start

```bash
# 1. Install dependencies
bun install   # or npm install

# 2. Build TypeScript
bun run build # Compiles with 0 errors

# 3. Run Automated Tests
bun test

# 4. Start Development Server
bun run dev   # or npm run dev
```
