import { z } from 'zod';

export const createBookingSchema = z.object({
  userId: z.string(),
  roomId: z.string(),
  checkIn: z.string().or(z.date()),
  checkOut: z.string().or(z.date()),
  totalPrice: z.number().int().positive(),
  proofUrl: z.string().url().optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI', 'DIBATALKAN', 'KADALUARSA']).optional(),
  totalPrice: z.number().int().positive().optional(),
});

export const bookingIdSchema = z.object({
  id: z.string(),
});

export const manualPaymentSchema = z.object({
  proofUrl: z.string().url(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>;
