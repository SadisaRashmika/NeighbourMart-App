import { ShopModel } from '../models/Shop.js';

export function findShopById(shopId: string) {
  return ShopModel.findById(shopId).lean();
}
