import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI,
};
