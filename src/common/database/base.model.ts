import { Schema, Document } from 'mongoose';

export interface IBaseDocument extends Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const baseModelOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};
