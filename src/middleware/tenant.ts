import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      requestId: string;
    }
  }
}

export const extractTenantId = (req?: Request): string => {
  if (!req) return 'tenant_default';
  return req.tenantId || (req.headers?.['x-tenant-id'] as string)?.trim() || 'tenant_default';
};

export const extractRequestId = (req?: Request): string => {
  if (!req) return 'req_system';
  return req.requestId || (req.headers?.['x-request-id'] as string)?.trim() || 'req_system';
};

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const headerTenant = req.headers['x-tenant-id'] as string;
  const tenantId = headerTenant ? headerTenant.trim() : 'tenant_default';
  const requestId = (req.headers['x-request-id'] as string) || `req_${crypto.randomUUID()}`;

  req.tenantId = tenantId;
  req.requestId = requestId;

  res.setHeader('x-tenant-id', tenantId);
  res.setHeader('x-request-id', requestId);

  next();
};
