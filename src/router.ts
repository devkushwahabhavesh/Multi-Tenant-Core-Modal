import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { templateRouter } from './modules/_template/_template.routes.js';
import { config } from './config/env.js';

export function createRouter(): Router {
  const router = Router();

  // Root System Healthcheck
  router.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      app: config.appName,
      env: config.env,
      timestamp: new Date().toISOString(),
    });
  });

  // Core Vertical Modules
  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/_template', templateRouter);

  return router;
}
