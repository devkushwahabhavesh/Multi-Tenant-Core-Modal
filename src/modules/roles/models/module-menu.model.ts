import { Schema, model } from 'mongoose';
import { IBaseDocument, baseModelOptions } from '../../../common/database/base.model.js';

export interface IModuleMenu extends IBaseDocument {
  tenantId: string;
  name: string;
  code: string;
  path?: string;
  icon?: string;
  order: number;
  parentId?: string;
  isMenu: boolean;
  isActive: boolean;
  description?: string;
}

const ModuleMenuSchema = new Schema<IModuleMenu>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    path: { type: String, trim: true },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    parentId: { type: String, default: null, index: true },
    isMenu: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
  },
  baseModelOptions
);

ModuleMenuSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ModuleMenuSchema.index({ tenantId: 1, order: 1 });

export const ModuleMenuModel = model<IModuleMenu>('ModuleMenu', ModuleMenuSchema);
