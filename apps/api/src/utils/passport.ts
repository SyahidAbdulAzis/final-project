import type { Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        passReqToCallback: true,
        state: true,
      },
      async (req: Request, _accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Email tidak ditemukan dari Google'), false);

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            const sessionRole = (req.session as any)?.oauthRole || 'user';
            const role = sessionRole === 'tenant' ? 'TENANT' : 'USER';

            user = await prisma.user.create({
              data: {
                email,
                fullName: profile.displayName || '',
                photoUrl: profile.photos?.[0]?.value || '',
                role,
                isVerified: true,
                passwordHash: '',
              },
            });
          } else if (!user.isVerified) {
            user = await prisma.user.update({
              where: { email },
              data: { isVerified: true },
            });
          }

          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
          );

          return done(null, { token, user } as any);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

export default passport;
