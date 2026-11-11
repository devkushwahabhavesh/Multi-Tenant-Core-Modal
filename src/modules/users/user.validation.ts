import { z } from 'zod';

export const UpdateUserValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(['USER', 'ADMIN', 'MANAGER']).optional(),
    isActive: z.boolean().optional(),
  }),
});
