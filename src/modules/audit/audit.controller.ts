import { BaseController } from '../../common/controllers/base.controller.js';
import { AuditLogModel, IAuditLog } from './audit-log.model.js';
import { logger } from '../../common/logger/logger.js';

export interface AuditLogInput {
  tenantId?: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditController extends BaseController<IAuditLog> {
  constructor() {
    super(AuditLogModel, 'AuditLog');
  }

  public async logAction(entry: AuditLogInput): Promise<IAuditLog> {
    const tenantId = entry.tenantId || 'tenant_default';
    const log = await this.create({ ...entry, tenantId });
    logger.info(
      `[AUDIT] ${entry.actorId} executed ${entry.action} on ${entry.targetType}:${entry.targetId}`
    );
    return log;
  }
}

export const auditController = new AuditController();
