import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { createReviewHandler, getReviewHandler } from '../controllers/review.controller.js';

const reviewRouter = Router();

reviewRouter.post('/reviews/:bookingId', verifyToken, createReviewHandler);
reviewRouter.get('/reviews/:bookingId', verifyToken, getReviewHandler);

export default reviewRouter;
