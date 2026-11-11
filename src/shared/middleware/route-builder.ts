import { Router, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { validate } from './validate.js';
import { asyncHandler } from './async-handler.js';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
  handler: RequestHandler;
  middlewares?: RequestHandler[];
  schema?: ZodSchema;
  auth?: boolean;
}

/**
 * Creates an Express router dynamically by looping over an array of RouteDefinitions.
 * Eliminates boilerplate router.get/post/patch repeated declarations.
 */
export function createModuleRouter(routes: RouteDefinition[]): Router {
  const router = Router();

  for (const route of routes) {
    const chain: RequestHandler[] = [];

    // 1. Attach custom middlewares (e.g. authenticate, authorize)
    if (route.middlewares && route.middlewares.length > 0) {
      chain.push(...route.middlewares);
    }

    // 2. Attach Zod validation middleware if schema is provided
    if (route.schema) {
      chain.push(validate(route.schema));
    }

    // 3. Wrap handler in asyncHandler to catch unhandled async errors
    chain.push(asyncHandler(route.handler));

    // 4. Register on Express router dynamically
    router[route.method](route.path, ...chain);
  }

  return router;
}

