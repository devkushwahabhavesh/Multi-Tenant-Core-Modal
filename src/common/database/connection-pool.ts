import mongoose, { Connection } from 'mongoose';
import { config } from '../../config/env.js';
import { logger } from '../logger/logger.js';

// Centralized Connection Pool Map
const connectionPool = new Map<string, Connection>();

export const getTenantDatabaseConnection = async (
  tenantId = 'tenant_default'
): Promise<Connection> => {
  if (connectionPool.has(tenantId)) {
    return connectionPool.get(tenantId)!;
  }

  // Generate dynamic connection URI per tenant or use default multi-tenant schema isolation
  const baseUri = config.mongodb.uri;
  const tenantUri = baseUri.includes('?')
    ? baseUri.replace(/\/[^/?]+(\?)/, `/${tenantId}$1`)
    : `${baseUri.replace(/\/$/, '')}_${tenantId}`;

  try {
    const conn = mongoose.createConnection(tenantUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      autoIndex: config.env !== 'production',
    });

    conn.on('connected', () => {
      logger.info(`Database connection established for tenant [${tenantId}]`);
    });

    conn.on('error', (err) => {
      logger.error(`Database error for tenant [${tenantId}]:`, err);
    });

    connectionPool.set(tenantId, conn);
    return conn;
  } catch (err) {
    logger.error(`Failed connecting to database for tenant [${tenantId}]:`, err);
    return mongoose.connection;
  }
};

export const closeAllConnections = async (): Promise<void> => {
  for (const [tenantId, conn] of connectionPool.entries()) {
    await conn.close();
    logger.info(`Closed database connection for tenant [${tenantId}]`);
  }
  connectionPool.clear();
  await mongoose.disconnect();
};
