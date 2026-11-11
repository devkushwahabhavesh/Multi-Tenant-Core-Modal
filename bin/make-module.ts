#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('\n❌ Error: Please specify the module name.');
  console.log('👉 Usage: bun run make:module <module-name>');
  console.log('👉 Example: bun run make:module products\n');
  process.exit(1);
}

const cleanName = moduleName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
const pascalName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../src');
const modulesDir = path.join(srcDir, 'modules');
const targetDir = path.join(modulesDir, cleanName);

if (fs.existsSync(targetDir)) {
  console.error(`\n❌ Error: Module "${cleanName}" already exists at: ${targetDir}\n`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

// 1. Mongoose Model
fs.writeFileSync(
  path.join(targetDir, `${cleanName}.model.ts`),
  `import { Schema, model } from 'mongoose';
import { IBaseDocument, baseModelOptions } from '../../common/database/base.model.js';

export interface I${pascalName} extends IBaseDocument {
  tenantId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const ${pascalName}Schema = new Schema<I${pascalName}>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  baseModelOptions
);

export const ${pascalName}Model = model<I${pascalName}>('${pascalName}', ${pascalName}Schema);
`
);

// 2. Zod Validation
fs.writeFileSync(
  path.join(targetDir, `${cleanName}.validation.ts`),
  `import { z } from 'zod';

export const Create${pascalName}Validation = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  }),
});

export const Update${pascalName}Validation = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});
`
);

// 3. Controller (Extends BaseController with full built-in CRUD)
fs.writeFileSync(
  path.join(targetDir, `${cleanName}.controller.ts`),
  `import { BaseController } from '../../common/controllers/base.controller.js';
import { ${pascalName}Model, I${pascalName} } from './${cleanName}.model.js';

export class ${pascalName}Controller extends BaseController<I${pascalName}> {
  constructor() {
    super(${pascalName}Model, '${pascalName}');
  }
}

export const ${cleanName}Controller = new ${pascalName}Controller();
`
);

// 4. Declarative Array Routes
fs.writeFileSync(
  path.join(targetDir, `${cleanName}.routes.ts`),
  `import { RouteDefinition, createModuleRouter } from '../../middleware/route-builder.js';
import { ${cleanName}Controller } from './${cleanName}.controller.js';
import { Create${pascalName}Validation, Update${pascalName}Validation } from './${cleanName}.validation.js';
import { authenticate } from '../../middleware/auth.js';

const routes: RouteDefinition[] = [
  {
    method: 'get',
    path: '/',
    middlewares: [authenticate],
    handler: ${cleanName}Controller.handleList,
  },
  {
    method: 'get',
    path: '/:id',
    middlewares: [authenticate],
    handler: ${cleanName}Controller.handleGetById,
  },
  {
    method: 'post',
    path: '/',
    middlewares: [authenticate],
    schema: Create${pascalName}Validation,
    handler: ${cleanName}Controller.handleCreate,
  },
  {
    method: 'patch',
    path: '/:id',
    middlewares: [authenticate],
    schema: Update${pascalName}Validation,
    handler: ${cleanName}Controller.handleUpdate,
  },
  {
    method: 'delete',
    path: '/:id',
    middlewares: [authenticate],
    handler: ${cleanName}Controller.handleDelete,
  },
];

export const ${cleanName}Router = createModuleRouter(routes);
`
);

console.log(`\n🎉 Module "${cleanName}" generated successfully at:\n📂 ${targetDir}\n`);
console.log(`📌 To register it, open "src/router.ts" and add:`);
console.log(
  `   import { ${cleanName}Router } from './modules/${cleanName}/${cleanName}.routes.js';`
);
console.log(`   router.use('/${cleanName}', ${cleanName}Router);\n`);
