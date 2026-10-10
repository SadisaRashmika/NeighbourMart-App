import dns from 'node:dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { environment } from '../config/environment.js';
import { UserModel } from '../models/User.js';
import { ShopModel } from '../models/Shop.js';
import { ProductModel } from '../models/Product.js';
import { ensurePickupSlots } from '../services/member2PickupSlots.js';

async function main() {
  if (!environment.mongoUri) throw new Error('MONGO_URI is required');
  if (new URL(environment.mongoUri).pathname !== '/NeighbourMartDevelopment') throw new Error('Demo seeding requires the isolated NeighbourMartDevelopment database');
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  await mongoose.connect(environment.mongoUri);
  try {
    const passwordHash = await bcrypt.hash('NeighbourDemo2026!', 10);
    async function user(email: string, name: string, role: 'customer' | 'shop') {
      return UserModel.findOneAndUpdate({ email }, { $setOnInsert: { email, name, role, location: 'Kandy', emailVerified: true, passwordHash } }, { upsert: true, new: true });
    }
    await user('customer@neighbourmart.test', 'Demo Customer', 'customer');
    const owner = await user('shop@neighbourmart.test', 'Demo Shop Owner', 'shop');
    const shop = await ShopModel.findOneAndUpdate({ owner: owner._id }, { $setOnInsert: { owner: owner._id, name: "Silva's Corner Grocery (Demo)", address: 'Peradeniya Road, Kandy', openingTime: '07:30', closingTime: '21:00', packingFee: 50, communityDiscount: 40 } }, { upsert: true, new: true });
    for (const p of [
      { name: 'Red Onions 1kg', category: 'Vegetables', price: 290 },
      { name: 'Big Onions 1kg', category: 'Vegetables', price: 240 },
      { name: 'Highland Fresh Milk 1L', category: 'Dairy', price: 480 },
      { name: 'Kotmale Fresh Milk 1L', category: 'Dairy', price: 450 },
      { name: 'Mysore Dhal 1kg', category: 'Pulses', price: 340 },
      { name: 'Red Dhal 1kg', category: 'Pulses', price: 320 },
    ]) await ProductModel.updateOne({ shop: shop._id, name: p.name }, { $setOnInsert: { ...p, shop: shop._id, stock: 20, available: true } }, { upsert: true });
    await ensurePickupSlots(shop.id);
    console.log('Member 2 demo accounts/products ready. Existing demo records were preserved.');
  } finally { await mongoose.disconnect(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
