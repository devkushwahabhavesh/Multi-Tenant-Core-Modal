# Generic Core Module Blueprint

Duplicate this `_template/` folder whenever you want to add a new business module (e.g. `products`, `orders`, `notifications`).

### Recommended Structure Inside Each Module:
```
modules/[your-module]/
├── [module].model.ts        # Mongoose Schema & Document interface
├── [module].service.ts      # Pure business logic and database queries
├── [module].schemas.ts      # Zod validation schemas (body, query, params)
├── [module].routes.ts       # Express router & endpoint declarations
└── [module].test.ts         # Unit & integration tests
```

### Mounting the Module:
Import your router in `src/router.ts`:
```typescript
import { yourRouter } from './modules/your-module/your-module.routes.js';

router.use('/your-module', yourRouter);
```

