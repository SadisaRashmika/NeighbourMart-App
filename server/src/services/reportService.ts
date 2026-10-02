import { OrderModel } from '../models/Order.js';

export function countCompletedOrders(shopId: string) {
  return OrderModel.countDocuments({ shop: shopId, status: 'picked-up' });
}
