import { OrderModel } from '../models/Order.js';

export function findOrdersByCustomer(customerId: string) {
  return OrderModel.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
}

export function findOrdersByShop(shopId: string) {
  return OrderModel.find({ shop: shopId }).sort({ createdAt: -1 }).lean();
}
