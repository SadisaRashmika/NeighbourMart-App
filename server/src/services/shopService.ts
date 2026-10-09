import type { Request } from 'express';
import { ShopModel } from '../models/Shop.js';

export function findShopById(shopId: string) {
  return ShopModel.findById(shopId).lean();
}

export function findAllShops() {
  return ShopModel.find().lean();
}

export async function resolveShop(request: Request) {
  const userId = (request as Request & { userId?: string }).userId;
  const shop = userId ? await ShopModel.findOne({ owner: userId }) : null;
  if (shop) return shop;
  throw Object.assign(new Error('Shop profile not found'), { status: 404 });
}
