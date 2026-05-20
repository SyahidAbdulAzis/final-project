import { Router } from 'express';
import {
  changePasswordHandler,
  forgotPasswordHandler,
  loginHandler,
  profileGetHandler,
  profilePatchHandler,
  registerHandler,
  resendHandler,
  resetPasswordHandler,
  verifyHandler,
} from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/auth/register/:role', registerHandler);
authRouter.post('/auth/verify', verifyHandler);
authRouter.post('/auth/login/:role', loginHandler);
authRouter.post('/auth/resend-verification', resendHandler);
authRouter.post('/auth/forgot-password', forgotPasswordHandler);
authRouter.post('/auth/reset-password', resetPasswordHandler);
authRouter.get('/auth/profile/:email', profileGetHandler);
authRouter.patch('/auth/profile/:email', profilePatchHandler);
authRouter.patch('/auth/profile/:email/password', changePasswordHandler);
