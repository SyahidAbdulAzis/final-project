import type { Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

declare module 'express-session' {
  interface SessionData {
    oauthRole?: string;
    oauthIntent?: string;
  }
}

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

          const sessionRole = req.session?.oauthRole || 'user';
          const expectedRole = sessionRole === 'tenant' ? 'TENANT' : 'USER';

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                fullName: profile.displayName || '',
                photoUrl: profile.photos?.[0]?.value || '',
                role: expectedRole,
                isVerified: true,
                passwordHash: null,
              },
            });
          } else {
            if (user.role !== expectedRole) {
              const roleLabel = user.role === 'TENANT' ? 'Tuan Rumah' : 'Penyewa';
              return done(null, false, {
                message: `Email sudah terdaftar sebagai ${roleLabel}. Silakan login di halaman yang sesuai.`,
              });
            }
            if (!user.isVerified) {
              user = await prisma.user.update({
                where: { email },
                data: { isVerified: true },
              });
            }
          }

          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
          );

          return done(null, { token, user } as unknown as Express.User);
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
