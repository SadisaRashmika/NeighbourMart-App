import mongoose from 'mongoose';

export async function connectDatabase(mongoUri: string | undefined) {
  if (!mongoUri) {
    console.warn('MONGO_URI is not set; starting without a database connection');
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB Atlas successfully!');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection failed. Check Atlas Network Access, cluster status, and credentials.');
    console.error(message);
  }
}

export function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
