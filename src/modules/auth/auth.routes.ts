import { RouteDefinition, createModuleRouter } from '../../shared/middleware/route-builder.js';
import { AuthController } from './auth.controller.js';
import { RegisterSchema, LoginSchema } from './auth.schemas.js';
import { authenticate } from '../../shared/middleware/auth.js';

const routes: RouteDefinition[] = [
  {
    method: 'post',
    path: '/register',
    schema: RegisterSchema,
    handler: AuthController.register,
  },
  {
    method: 'post',
    path: '/login',
    schema: LoginSchema,
    handler: AuthController.login,
  },
  {
    method: 'get',
    path: '/me',
    middlewares: [authenticate],
    handler: AuthController.me,
  },
];

export const authRouter = createModuleRouter(routes);
