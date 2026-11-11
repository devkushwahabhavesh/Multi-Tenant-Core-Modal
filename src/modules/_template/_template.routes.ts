import { RouteDefinition, createModuleRouter } from '../../shared/middleware/route-builder.js';
import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.js';

const routes: RouteDefinition[] = [
  {
    method: 'get',
    path: '/',
    handler: (_req: Request, res: Response) => {
      return sendSuccess(res, {
        message: 'Template module blueprint. Duplicate this directory to scaffold any new module.',
      });
    },
  },
];

export const templateRouter = createModuleRouter(routes);
