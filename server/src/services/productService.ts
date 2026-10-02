import { ProductModel } from '../models/Product.js';

export function findProductsByShop(shopId: string) {
  return ProductModel.find({ shop: shopId }).lean();
}
