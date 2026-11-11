import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { rolesRouter } from './modules/roles/routes/role.routes.js';
import { config } from './config/env.js';
import { getTenantId, getRequestId } from './common/context/index.js';

export const createRouter = (): Router => {
  const router = Router();

  // Root System Healthcheck with active Tenant & Request Tracing
  router.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      app: config.appName,
      env: config.env,
      tenantId: getTenantId(),
      requestId: getRequestId(),
      timestamp: new Date().toISOString(),
    });
  });

  // Vertical Modules
  router.use('/auth', authRouter);
  router.use('/users', userRouter);
  router.use('/roles', rolesRouter);
  router.use('/rbac', rolesRouter); // Backward compatibility alias

  return router;
};
