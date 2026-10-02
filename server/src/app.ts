import cors from 'cors';
import express from 'express';
import { getDatabaseStatus } from './config/database.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({
      ok: true,
      service: 'neighbourmart-backend',
      database: getDatabaseStatus(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found' });
  });

  app.use(errorMiddleware);

  return app;
}
