import { Request, Response } from 'express';
import { Model, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';
import { IBaseDocument } from '../database/base.model.js';
import { NotFoundError } from '../errors/index.js';
import { sendSuccess } from '../utils/response.js';
import { extractTenantId } from '../../middleware/tenant.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * BaseController: Standardized class-based controller with full database CRUD methods.
 * Centralizes findOne, findById, findAll, create, update, and delete operations.
 */
export class BaseController<T extends IBaseDocument> {
  protected model: Model<T>;
  protected entityName: string;

  constructor(model: Model<T>, entityName: string) {
    this.model = model;
    this.entityName = entityName;
  }

  protected sanitizeResponse(doc: any): any {
    if (!doc) return doc;
    return typeof doc.toObject === 'function' ? doc.toObject() : doc;
  }

  protected withTenantFilter(filter: FilterQuery<T> = {}, tenantId = 'tenant_default'): FilterQuery<T> {
    if (this.model.schema.path('tenantId')) {
      return { ...filter, tenantId };
    }
    return filter;
  }

  // ================= Direct Database Operations =================

  public async findAll(
    filter: FilterQuery<T> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const scopedFilter = this.withTenantFilter(filter);

    const [items, total] = await Promise.all([
      this.model.find(scopedFilter).skip(skip).limit(limit).sort(sort),
      this.model.countDocuments(scopedFilter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findById(id: string): Promise<T> {
    const scopedFilter = this.withTenantFilter({ _id: id } as any);
    const item = await this.model.findOne(scopedFilter);
    if (!item) {
      throw new NotFoundError(this.entityName, id);
    }
    return item;
  }

  public async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const scopedFilter = this.withTenantFilter(filter);
    return this.model.findOne(scopedFilter);
  }

  public async create(data: Partial<T>, session?: ClientSession, tenantId = 'tenant_default'): Promise<T> {
    const finalTenant = (data as any).tenantId || tenantId;
    const payload = this.model.schema.path('tenantId') ? { ...data, tenantId: finalTenant } : data;

    if (session) {
      const [created] = await this.model.create([payload], { session });
      return created;
    }
    return this.model.create(payload as any);
  }

  public async update(id: string, updates: UpdateQuery<T>, session?: ClientSession): Promise<T> {
    const scopedFilter = this.withTenantFilter({ _id: id } as any);
    const updated = await this.model.findOneAndUpdate(scopedFilter, updates, {
      new: true,
      session,
    });
    if (!updated) {
      throw new NotFoundError(this.entityName, id);
    }
    return updated;
  }

  public async delete(id: string, session?: ClientSession): Promise<{ id: string; deleted: true }> {
    const scopedFilter = this.withTenantFilter({ _id: id } as any);
    const deleted = await this.model.findOneAndDelete(scopedFilter, { session });
    if (!deleted) {
      throw new NotFoundError(this.entityName, id);
    }
    return { id, deleted: true };
  }

  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    const scopedFilter = this.withTenantFilter(filter);
    return this.model.countDocuments(scopedFilter);
  }

  // ================= Standard HTTP Handlers =================

  public handleList = async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await this.findAll({}, { page, limit });
    return sendSuccess(res, result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  };

  public handleGetById = async (req: Request, res: Response): Promise<Response> => {
    const item = await this.findById(req.params.id);
    return sendSuccess(res, item);
  };

  public handleCreate = async (req: Request, res: Response): Promise<Response> => {
    const created = await this.create(req.body);
    return sendSuccess(res, created, 201);
  };

  public handleUpdate = async (req: Request, res: Response): Promise<Response> => {
    const updated = await this.update(req.params.id, req.body);
    return sendSuccess(res, updated);
  };

  public handleDelete = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.delete(req.params.id);
    return sendSuccess(res, result);
  };
}
