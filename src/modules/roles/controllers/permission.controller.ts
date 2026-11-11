import { Request, Response } from 'express';
import { BaseController } from '../../../common/controllers/base.controller.js';
import { PermissionModel, IPermission } from '../models/permission.model.js';
import { permissionService, PermissionService } from '../services/permission.service.js';
import { sendSuccess } from '../../../common/utils/response.js';

export class PermissionController extends BaseController<IPermission> {
  constructor(private readonly service: PermissionService = permissionService) {
    super(PermissionModel, 'Permission');
  }

  public handleApprove = async (req: Request, res: Response): Promise<Response> => {
    const approved = await this.service.approvePermission(req.params.id);
    return sendSuccess(res, approved);
  };

  public handleReject = async (req: Request, res: Response): Promise<Response> => {
    const rejected = await this.service.rejectPermission(req.params.id);
    return sendSuccess(res, rejected);
  };

  public handleExport = async (_req: Request, res: Response): Promise<Response> => {
    const permissions = await this.service.exportPermissions();
    return sendSuccess(res, permissions);
  };

  public handleImport = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.service.importPermissions(req.body.permissions);
    return sendSuccess(res, result);
  };
}

export const permissionController = new PermissionController();
