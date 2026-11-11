import { Request, Response } from 'express';
import { BaseService } from '../services/base.service.js';
import { sendSuccess } from '../utils/response.js';
import { IBaseDocument } from '../database/base.schema.js';

/**
 * Generic Base Controller that handles standard CRUD HTTP requests.
 * Eliminates repetitive request extraction and sendSuccess calls across modules.
 */
export class BaseController<T extends IBaseDocument> {
  constructor(protected service: BaseService<T>) {}

  list = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await this.service.list({}, { page, limit });
    return sendSuccess(res, result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  };

  getById = async (req: Request, res: Response) => {
    const item = await this.service.getById(req.params.id);
    return sendSuccess(res, item);
  };

  create = async (req: Request, res: Response) => {
    const item = await this.service.create(req.body);
    return sendSuccess(res, item, 201);
  };

  update = async (req: Request, res: Response) => {
    const item = await this.service.update(req.params.id, req.body);
    return sendSuccess(res, item);
  };

  delete = async (req: Request, res: Response) => {
    const result = await this.service.delete(req.params.id);
    return sendSuccess(res, result);
  };
}

