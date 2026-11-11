import { RouteDefinition, createModuleRouter } from '../../shared/middleware/route-builder.js';
import { usersController } from './users.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';

const routes: RouteDefinition[] = [
  {
    method: 'get',
    path: '/',
    middlewares: [authenticate, authorize('ADMIN', 'MANAGER')],
    handler: usersController.list,
  },
  {
    method: 'get',
    path: '/:id',
    middlewares: [authenticate],
    handler: usersController.getById,
  },
];

export const usersRouter = createModuleRouter(routes);
