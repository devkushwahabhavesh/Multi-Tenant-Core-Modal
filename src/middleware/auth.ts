import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../common/errors/index.js';
import { verifyToken, TokenPayload } from '../common/utils/jwt.js';
import { extractTenantId } from './tenant.js';
import { userController } from '../modules/users/user.controller.js';
import { permissionService } from '../modules/roles/services/permission.service.js';
import { IUser } from '../modules/users/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userDocument?: IUser;
    }
  }
}

export class AuthorizationMiddleware {
  /**
   * Centralized authentication middleware: validates Bearer token, extracts tenant,
   * verifies user existence and active status.
   */
  public static authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Missing or malformed Authorization header'));
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      req.user = payload;

      const currentTenant = extractTenantId(req);
      if (payload.tenantId && payload.tenantId !== currentTenant) {
        return next(
          new ForbiddenError(
            `Cross-tenant breach attempt: Token tenant '${payload.tenantId}' does not match request tenant '${currentTenant}'`
          )
        );
      }

      const user = await userController.findById(payload.userId);
      if (!user || !user.isActive) {
        return next(new UnauthorizedError('User account not found or has been deactivated'));
      }
      req.userDocument = user;

      next();
    } catch {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  };

  /**
   * Centralized dynamic permission authorization middleware:
   * Checks moduleCode, action, role assignments, user overrides, and scopes.
   */
  public static authorize = (
    moduleCode: string,
    action: string,
    resolveOwnerId?: (req: Request) => string | undefined
  ) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.userDocument) {
        return next(new UnauthorizedError('Authentication required before authorization'));
      }

      const resourceOwnerId = resolveOwnerId ? resolveOwnerId(req) : undefined;
      const hasAccess = await permissionService.checkAccess(
        req.userDocument,
        moduleCode,
        action,
        resourceOwnerId
      );

      if (!hasAccess) {
        return next(
          new ForbiddenError(
            `Unauthorized: Insufficient permissions for module '${moduleCode}' and action '${action}'`
          )
        );
      }

      next();
    };
  };

  /**
   * Role-based guard middleware for high-level administrative checks.
   */
  public static requireRole = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new UnauthorizedError());
      }
      if (!roles.includes(req.user.role)) {
        return next(
          new ForbiddenError(`Required role: [${roles.join(', ')}]. Current role: ${req.user.role}`)
        );
      }
      next();
    };
  };
}

export const authenticate = AuthorizationMiddleware.authenticate;
export const authorize = AuthorizationMiddleware.authorize;
export const requireRole = AuthorizationMiddleware.requireRole;
