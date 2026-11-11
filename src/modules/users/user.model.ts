import { Schema, model } from 'mongoose';
import { IBaseDocument, baseModelOptions } from '../../common/database/base.model.js';

export interface IUserOverride {
  permissionId: string;
  effect: 'GRANT' | 'DENY';
  scope?: 'ALL' | 'OWN' | 'ASSIGNED' | 'CUSTOM';
}

export interface IUser extends IBaseDocument {
  tenantId: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  roleIds: string[];
  permissionOverrides: IUserOverride[];
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[];
}

const UserOverrideSchema = new Schema(
  {
    permissionId: { type: String, required: true },
    effect: { type: String, enum: ['GRANT', 'DENY'], required: true },
    scope: { type: String, enum: ['ALL', 'OWN', 'ASSIGNED', 'CUSTOM'] },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN', 'MANAGER'], default: 'USER', index: true },
    roleIds: [{ type: String, index: true }],
    permissionOverrides: [UserOverrideSchema],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokens: [{ type: String }],
  },
  baseModelOptions
);

UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

export const UserModel = model<IUser>('User', UserSchema);
