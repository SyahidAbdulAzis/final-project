import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { propertyRouter } from './routes/property.route.js';
import { bookingRouter } from './routes/booking.route.js';
import { userRouter } from './routes/user.route.js';
import { roomRouter } from './routes/room.route.js';

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json({ limit: '10mb', strict: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', authRouter);
app.use('/api', propertyRouter);
app.use('/api', bookingRouter);
app.use('/api', userRouter);
app.use('/api', roomRouter);

app.listen(port, () => {
  process.stdout.write(`API ready bossku at http://localhost:${port}\n`);
});
