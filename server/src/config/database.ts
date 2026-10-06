import dns from 'node:dns';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';

export async function connectDatabase(mongoUri: string | undefined) {
  if (!mongoUri) {
    console.warn('MONGO_URI is not set; starting without a database connection');
    return;
  }

  if (mongoUri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      await UserModel.syncIndexes();
      console.log('Connected to MongoDB Atlas successfully!');
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`MongoDB connection attempt ${attempt}/3 failed: ${message}`);
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error('MongoDB is unavailable. Auth requests will return a database-unavailable response until the server is restarted successfully.');
}

export function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
