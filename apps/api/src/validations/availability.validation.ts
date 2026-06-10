import { z } from 'zod';

export const availabilityCreateSchema = z.object({
  roomId: z.string().min(1, 'Room wajib dipilih'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal tidak valid' }),
  isAvailable: z.boolean().default(true),
});

export const availabilityBulkSchema = z.object({
  roomId: z.string().min(1),
  dates: z.array(z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal tidak valid' })),
  isAvailable: z.boolean().default(true),
});

export const seasonalRateCreateSchema = z.object({
  roomId: z.string().min(1, 'Room wajib dipilih'),
  name: z.string().min(1, 'Nama tarif wajib diisi').max(100),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal mulai tidak valid' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal selesai tidak valid' }),
  adjustmentType: z.enum(['NOMINAL', 'PERCENTAGE']),
  adjustmentValue: z.coerce.number().int().min(0),
});

export const seasonalRateUpdateSchema = seasonalRateCreateSchema.partial().omit({ roomId: true });

export type AvailabilityCreateInput = z.infer<typeof availabilityCreateSchema>;
export type AvailabilityBulkInput = z.infer<typeof availabilityBulkSchema>;
export type SeasonalRateCreateInput = z.infer<typeof seasonalRateCreateSchema>;
export type SeasonalRateUpdateInput = z.infer<typeof seasonalRateUpdateSchema>;
