import { Schema, model } from 'mongoose';
import { IBaseDocument, baseModelOptions } from '../../common/database/base.model.js';

export interface IAuditLog extends IBaseDocument {
  tenantId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: String, required: true, index: true },
    actorId: { type: String, required: true, index: true },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  baseModelOptions
);

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);
