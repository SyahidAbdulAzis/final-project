import { z } from 'zod';

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(20).default(6),
  city: z.string().default('Semua'),
  name: z.string().default(''),
  category: z.string().default('Semua'),
  sortBy: z.enum(['name', 'price']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().int().min(1).default(1),
});

export const propertyCreateSchema = z.object({
  name: z.string().min(1, 'Nama properti wajib diisi').max(100),
  city: z.string().min(1, 'Kota wajib diisi').max(50),
  address: z.string().min(1, 'Alamat wajib diisi').max(200),
  province: z.string().max(50).optional(),
  latitude: z.coerce.number().optional().default(0),
  longitude: z.coerce.number().optional().default(0),
  description: z.string().max(2000).optional().default(''),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  images: z.array(z.string().url()).optional().default([]),
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
