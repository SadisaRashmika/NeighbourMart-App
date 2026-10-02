import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const port = Number(process.env.PORT ?? 5000);
const mongodbUri = process.env.MONGO_URI;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'neighbourmart-backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  if (mongodbUri) {
    try {
      await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 10000 });
      console.log('Connected to MongoDB Atlas successfully!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('MongoDB connection failed. Check Atlas Network Access, cluster status, and credentials.');
      console.error(message);
    }
  } else {
    console.warn('MONGO_URI is not set; starting without a database connection');
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start the backend', error);
  process.exitCode = 1;
});
