import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(50),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
