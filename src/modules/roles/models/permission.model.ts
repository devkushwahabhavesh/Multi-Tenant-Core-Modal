import { Schema, model } from 'mongoose';
import { IBaseDocument, baseModelOptions } from '../../../common/database/base.model.js';

export type PermissionScope = 'ALL' | 'OWN' | 'ASSIGNED' | 'CUSTOM';
export type PermissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IPermission extends IBaseDocument {
  tenantId: string;
  name: string;
  code: string;
  moduleCode: string;
  action: string;
  scope: PermissionScope;
  description?: string;
  status: PermissionStatus;
  conditions?: Record<string, unknown>;
}

const PermissionSchema = new Schema<IPermission>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    moduleCode: { type: String, required: true, lowercase: true, trim: true, index: true },
    action: { type: String, required: true, lowercase: true, trim: true },
    scope: {
      type: String,
      enum: ['ALL', 'OWN', 'ASSIGNED', 'CUSTOM'],
      default: 'ALL',
    },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    conditions: { type: Schema.Types.Mixed },
  },
  baseModelOptions
);

PermissionSchema.index({ tenantId: 1, code: 1 }, { unique: true });
PermissionSchema.index({ tenantId: 1, moduleCode: 1, action: 1 });

export const PermissionModel = model<IPermission>('Permission', PermissionSchema);
