import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { createReviewHandler, getReviewHandler, replyToReviewHandler, getTenantReviewsHandler } from '../controllers/review.controller.js';

const reviewRouter = Router();

reviewRouter.get('/reviews/tenant/all', verifyToken, requireRole('TENANT'), getTenantReviewsHandler);
reviewRouter.post('/reviews/:bookingId', verifyToken, createReviewHandler);
reviewRouter.get('/reviews/:bookingId', verifyToken, getReviewHandler);
reviewRouter.post('/reviews/:reviewId/reply', verifyToken, requireRole('TENANT'), replyToReviewHandler);

export default reviewRouter;
