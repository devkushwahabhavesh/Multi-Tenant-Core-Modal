import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createRouter } from './router.js';
import { errorHandler } from './middleware/error-handler.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { apiLimiter } from './middleware/rate-limiter.js';
import { config } from './config/env.js';

export const createApp = (): express.Application => {
  const app = express();

  // HTTP Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(cors({ origin: config.corsOrigin }));

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Morgan HTTP Access Logging
  if (config.env !== 'test') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  }

  // Multi-Tenant Isolation Context
  app.use(tenantMiddleware);

  // Global API Rate Limiter
  app.use('/api/v1', apiLimiter);

  // Mount API v1
  app.use('/api/v1', createRouter());

  // Centralized Global Error Handler
  app.use(errorHandler);

  return app;
};
