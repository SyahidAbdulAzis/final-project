import { Router } from 'express';
import { getAllUsersHandler, getUserByIdHandler } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/users', verifyToken, getAllUsersHandler);
userRouter.get('/users/:id', verifyToken, getUserByIdHandler);

export { userRouter };
