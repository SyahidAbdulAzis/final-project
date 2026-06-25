import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { createReviewSchema } from '../validations/review.validation.js';
import { createReview, getReviewByBooking } from '../services/review.service.js';
import { badRequest, parseOrBad } from '../utils/controller.utils.js';

export async function createReviewHandler(req: AuthRequest, res: Response) {
  const bookingId = req.params.bookingId as string;
  if (!req.user) return badRequest(res, 'Unauthorized');

  const parsed = parseOrBad(res, createReviewSchema, req.body);
  if (!parsed) return;

  try {
    const review = await createReview(bookingId, req.user.id, parsed);
    return res.status(201).json(review);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getReviewHandler(req: AuthRequest, res: Response) {
  const bookingId = req.params.bookingId as string;

  try {
    const review = await getReviewByBooking(bookingId);
    return res.json({ review });
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
