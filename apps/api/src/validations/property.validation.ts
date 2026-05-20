import { z } from 'zod';

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(20).default(6),
  city: z.string().default('Semua'),
  name: z.string().default(''),
  category: z.string().default('Semua'),
  sortBy: z.enum(['name', 'price']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
