import { Schema, model } from 'mongoose';
import { IBaseDocument, baseSchemaOptions } from '../../shared/database/base.schema.js';

export interface IUser extends IBaseDocument {
  email: string;
  name: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN', 'MANAGER'], default: 'USER', index: true },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

export const UserModel = model<IUser>('User', UserSchema);

