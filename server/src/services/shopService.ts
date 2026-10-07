import type { Request } from 'express';
import { Types } from 'mongoose';
import { ShopModel } from '../models/Shop.js';

export function findShopById(shopId: string) {
  return ShopModel.findById(shopId).lean();
}

// TODO: replace with the authenticated shop owner once authMiddleware is implemented.
// Until then: x-shop-id header, else the first shop, else a demo shop.
export async function resolveShop(request: Request) {
  const id = request.header('x-shop-id');
  if (id && Types.ObjectId.isValid(id)) {
    const found = await ShopModel.findById(id);
    if (found) return found;
  }
  const first = await ShopModel.findOne().sort({ createdAt: 1 });
  if (first) return first;
  return ShopModel.create({
    owner: new Types.ObjectId(),
    name: "Silva's Corner",
    category: 'Grocery',
    address: 'Peradeniya Rd, Kandy',
  });
}
