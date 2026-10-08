import dotenv from 'dotenv';
import { setServers } from 'node:dns';

dotenv.config();
// Optional process-only override for networks that refuse Atlas SRV lookups.
if (process.env.MONGO_DNS_SERVERS) {
  setServers(process.env.MONGO_DNS_SERVERS.split(',').map(value => value.trim()).filter(Boolean));
}

export const environment = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI,
};
