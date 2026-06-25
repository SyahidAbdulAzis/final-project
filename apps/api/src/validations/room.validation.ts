import { z } from 'zod';

export const roomCreateSchema = z.object({
  propertyId: z.string().min(1, 'Property wajib dipilih'),
  name: z.string().min(1, 'Nama room wajib diisi').max(100),
  description: z.string().max(2000).optional().default(''),
  basePrice: z.coerce.number().int().min(0, 'Harga tidak boleh negatif'),
  maxGuests: z.coerce.number().int().min(1, 'Minimal 1 tamu').max(20),
});

export const roomUpdateSchema = roomCreateSchema.partial().omit({ propertyId: true });

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
