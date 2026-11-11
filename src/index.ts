import { createApp } from './app.js';
import { getTenantDatabaseConnection } from './common/database/connection-pool.js';
import { config } from './config/env.js';
import { logger } from './common/logger/logger.js';

const bootstrap = async () => {
  // Establish default DB connectivity
  await getTenantDatabaseConnection('tenant_default');

  const app = createApp();

  app.listen(config.port, () => {
    logger.info(`✨ Server running at http://localhost:${config.port}/api/v1/health`);
    logger.info(`🔒 Multi-Tenancy active: pass 'x-tenant-id' to isolate database queries`);
  });
};

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap failure:', err);
  process.exit(1);
});
