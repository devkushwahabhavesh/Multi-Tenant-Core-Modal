import { Schema, model } from 'mongoose';
import { IBaseDocument, baseModelOptions } from '../../../common/database/base.model.js';

export interface IRole extends IBaseDocument {
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  moduleIds: string[];
  permissionIds: string[];
  isSystem: boolean;
  isDefault: boolean;
  isActive: boolean;
}

const RoleSchema = new Schema<IRole>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    moduleIds: [{ type: String }],
    permissionIds: [{ type: String }],
    isSystem: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  baseModelOptions
);

RoleSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const RoleModel = model<IRole>('Role', RoleSchema);
