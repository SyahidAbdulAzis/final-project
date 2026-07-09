import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, 'Komentar wajib diisi'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const replyReviewSchema = z.object({
  reply: z.string().min(1, 'Balasan wajib diisi'),
});

export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
