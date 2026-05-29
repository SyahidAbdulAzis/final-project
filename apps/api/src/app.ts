import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { propertyRouter } from './routes/property.route.js';

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', authRouter);
app.use('/api', propertyRouter);

app.listen(port, () => {
  process.stdout.write(`API ready bossku at http://localhost:${port}\n`);
});
