import { Request, Response } from 'express';
import { BaseController } from '../../../common/controllers/base.controller.js';
import { ModuleMenuModel, IModuleMenu } from '../models/module-menu.model.js';
import { sendSuccess } from '../../../common/utils/response.js';

export interface ModuleMenuTreeNode extends IModuleMenu {
  children: ModuleMenuTreeNode[];
}

export class ModuleMenuController extends BaseController<IModuleMenu> {
  constructor() {
    super(ModuleMenuModel, 'ModuleMenu');
  }

  public handleGetTree = async (_req: Request, res: Response): Promise<Response> => {
    const result = await this.findAll({ isActive: true }, { limit: 500, sort: { order: 1 } });
    const items = result.items;

    const itemMap = new Map<string, any>();
    const roots: any[] = [];

    for (const item of items) {
      const obj = (item as any).toObject ? (item as any).toObject() : { ...item };
      obj.children = [];
      itemMap.set(obj.id, obj);
    }

    for (const item of items) {
      const node = itemMap.get(item.id);
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return sendSuccess(res, roots);
  };
}

export const moduleMenuController = new ModuleMenuController();
