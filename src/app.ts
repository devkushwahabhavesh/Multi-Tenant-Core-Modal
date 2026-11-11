import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createRouter } from './router.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { config } from './config/env.js';

export function createApp(): express.Application {
  const app = express();

  // Global Security & Parsers
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Mount API v1
  app.use('/api/v1', createRouter());

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

