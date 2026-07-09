import { Router } from 'express';
import passport from 'passport';
import { verifyToken } from '../middlewares/auth.middleware.js';
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
authRouter.get('/auth/profile/:email', verifyToken as any, profileGetHandler as any);
authRouter.patch('/auth/profile/:email', verifyToken as any, profilePatchHandler as any);
authRouter.patch('/auth/profile/:email/password', verifyToken as any, changePasswordHandler as any);

authRouter.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: any, data: any, info: any) => {
      const sessionRole = (req.session as any)?.oauthRole || 'user';
      const intent = (req.session as any)?.oauthIntent || 'login';
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';

      if (err || !data) {
        const errorMsg = encodeURIComponent(info?.message || 'Autentikasi Google gagal');
        const page = intent === 'register' ? 'register' : 'login';
        return res.redirect(`${frontend}/${page}/${sessionRole}?error=${errorMsg}`);
      }

      const token = data.token || '';
      const user = data.user || {};
      const role = user.role?.toLowerCase() || sessionRole;
      const email = encodeURIComponent(user.email || '');
      return res.redirect(`${frontend}/login/${role}?token=${token}&email=${email}`);
    })(req, res, next);
  }
);

authRouter.get(
  '/auth/google/start/:role',
  (req, res, next) => {
    const role = req.params.role;
    if (role !== 'user' && role !== 'tenant') {
      return res.status(400).json({ message: 'Role tidak valid' });
    }
    (req.session as any).oauthRole = role;
    (req.session as any).oauthIntent = (req.query.intent as string) || 'login';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  }
);
