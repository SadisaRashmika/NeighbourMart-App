import { ProductModel } from '../models/Product.js';

export function findProductsByShop(shopId: string) {
  return ProductModel.find({ shop: shopId }).sort({ createdAt: -1 }).lean();
}
export function createProduct(shopId: string, data: Record<string, unknown>) {
  return ProductModel.create({ ...data, shop: shopId });
}
export function updateProduct(shopId: string, id: string, data: Record<string, unknown>) {
  return ProductModel.findOneAndUpdate({ _id: id, shop: shopId }, { ...data, lastUpdatedAt: new Date() }, { new: true });
}
export function deleteProduct(shopId: string, id: string) {
  return ProductModel.findOneAndDelete({ _id: id, shop: shopId });
}
