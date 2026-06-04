import { Router } from 'express';
import { getAllUsersHandler, getUserByIdHandler } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/users', getAllUsersHandler);
userRouter.get('/users/:id', getUserByIdHandler);

export { userRouter };
