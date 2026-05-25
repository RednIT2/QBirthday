import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wishesRoutes from './routes/wishes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wishes', wishesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

export default app;
