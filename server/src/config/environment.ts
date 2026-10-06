import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
  mailUser: process.env.MAIL_USER,
  mailPassword: process.env.MAIL_PASSWORD,
  mailFrom: process.env.MAIL_FROM,
};
