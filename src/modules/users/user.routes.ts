import { RouteDefinition, createModuleRouter } from '../../middleware/route-builder.js';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const routes: RouteDefinition[] = [
  {
    method: 'get',
    path: '/',
    middlewares: [authenticate, authorize('users', 'read')],
    handler: userController.handleList,
  },
  {
    method: 'get',
    path: '/:id',
    middlewares: [authenticate, authorize('users', 'read', (req: any) => req.params.id)],
    handler: userController.handleGetById,
  },
  {
    method: 'patch',
    path: '/:id',
    middlewares: [authenticate, authorize('users', 'update', (req: any) => req.params.id)],
    handler: userController.handleUpdate,
  },
  {
    method: 'delete',
    path: '/:id',
    middlewares: [authenticate, authorize('users', 'delete')],
    handler: userController.handleDeactivate,
  },
];

export const userRouter = createModuleRouter(routes);
