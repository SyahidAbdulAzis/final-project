import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { createReviewSchema, replyReviewSchema } from '../validations/review.validation.js';
import { createReview, getReviewByBooking, replyToReview, getTenantReviews, getPropertyWithReviews } from '../services/review.service.js';
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

export async function replyToReviewHandler(req: AuthRequest, res: Response) {
  const reviewId = req.params.reviewId as string;
  if (!req.user) return badRequest(res, 'Unauthorized');

  const parsed = parseOrBad(res, replyReviewSchema, req.body);
  if (!parsed) return;

  try {
    const review = await replyToReview(reviewId, req.user.id, parsed);
    return res.json(review);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getTenantReviewsHandler(req: AuthRequest, res: Response) {
  if (!req.user) return badRequest(res, 'Unauthorized');
  const page = req.query.page ? parseInt(String(req.query.page)) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit)) : 5;

  try {
    const result = await getTenantReviews(req.user.id, page, limit);
    return res.json(result);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getPropertyWithReviewsHandler(req: AuthRequest, res: Response) {
  const propertyId = req.params.id as string;

  try {
    const property = await getPropertyWithReviews(propertyId);
    if (!property) return badRequest(res, 'Properti tidak ditemukan');
    return res.json(property);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
