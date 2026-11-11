import { Router, Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.js';

export const templateRouter = Router();

// GET /api/v1/_template
templateRouter.get('/', (_req: Request, res: Response) => {
  return sendSuccess(res, {
    message: 'Template module blueprint. Duplicate this directory to scaffold any new domain module.',
  });
});

