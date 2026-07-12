import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import './utils/passport.js';
import { authRouter } from './routes/auth.route.js';
import { propertyRouter } from './routes/property.route.js';
import { bookingRouter } from './routes/booking.route.js';
import { userRouter } from './routes/user.route.js';
import { roomRouter } from './routes/room.route.js';
import { categoryRouter } from './routes/category.route.js';
import { availabilityRouter } from './routes/availability.route.js';
import { uploadRouter } from './routes/upload.route.js';
import reportRouter from './routes/report.route.js';
import reviewRouter from './routes/review.route.js';
import { setupScheduler } from './utils/scheduler.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const app = express();
const port = Number(process.env.PORT) || 8000;

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000, secure: false },
}));
app.use(express.json({ limit: '10mb', strict: false }));
app.use(passport.initialize());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', authRouter);
app.use('/api', propertyRouter);
app.use('/api', bookingRouter);
app.use('/api', userRouter);
app.use('/api', roomRouter);
app.use('/api', categoryRouter);
app.use('/api', availabilityRouter);
app.use('/api', uploadRouter);
app.use('/api', reportRouter);
app.use('/api', reviewRouter);

app.listen(port, () => {
  process.stdout.write(`API ready bossku at http://localhost:${port}\n`);
  setupScheduler();
});
