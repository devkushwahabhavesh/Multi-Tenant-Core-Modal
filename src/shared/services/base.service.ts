import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseDocument } from '../database/base.schema.js';
import { NotFoundError } from '../../core/errors.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic Base Service for Mongoose CRUD operations.
 * Eliminates repetitive find, findById, create, update, delete methods across modules.
 */
export class BaseService<T extends IBaseDocument> {
  constructor(
    protected model: Model<T>,
    protected entityName: string
  ) {}

  async list(filter: FilterQuery<T> = {}, options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string): Promise<T> {
    const item = await this.model.findById(id);
    if (!item) {
      throw new NotFoundError(this.entityName, id);
    }
    return item;
  }

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, updates: UpdateQuery<T>): Promise<T> {
    const item = await this.model.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      throw new NotFoundError(this.entityName, id);
    }
    return item;
  }

  async delete(id: string): Promise<{ id: string; deleted: true }> {
    const item = await this.model.findByIdAndDelete(id);
    if (!item) {
      throw new NotFoundError(this.entityName, id);
    }
    return { id, deleted: true };
  }
}

