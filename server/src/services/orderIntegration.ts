import mongoose from 'mongoose';
import { OrderModel } from '../models/Order.js';
import { ShopModel } from '../models/Shop.js';
import { ProductModel } from '../models/Product.js';
import { PickupSlotModel } from '../models/PickupSlot.js';
import { fail, objectId } from './cartService.js';

export const transitions: Record<string, string[]> = {
  pending: ['accepted', 'cancelled'], accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'], ready: ['picked-up'], 'picked-up': [], cancelled: [],
};
export async function orderScope(user: { id: string; role: string }) {
  if (user.role === 'customer') return { customer: user.id };
  const shops = await ShopModel.find({ owner: user.id }).select('_id');
  return { shop: { $in: shops.map(shop => shop._id) } };
}
export async function serializeOrder(order: any) {
  await order.populate(['customer', 'shop', 'pickupSlot']);
  return {
    id: order.id, status: order.status, total: order.total,
    customerName: order.customer?.name ?? 'Customer',
    shop: order.shop ? { id: order.shop.id, name: order.shop.name, address: order.shop.address } : null,
    items: order.items.map((item: any) => ({ productId: String(item.product), name: item.name, quantity: item.quantity, unitPrice: item.unitPrice })),
    pickupSlot: order.pickupSlot ? { id: order.pickupSlot.id, date: order.pickupSlot.date.toISOString().slice(0,10), startTime: order.pickupSlot.startTime, endTime: order.pickupSlot.endTime } : null,
    pickupNote: order.pickupNote ?? '', paymentMethod: order.paymentMethod,
    packingFee: order.packingFee, communityDiscount: order.communityDiscount,
    lastStatusUpdateAt: order.lastStatusUpdateAt, createdAt: order.createdAt,
  };
}
export async function updateOrderStatus(user: { id: string; role: string }, id: string, status: unknown) {
  if (user.role !== 'shop') fail('Shop owner access required', 403);
  const scope = await orderScope(user);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await OrderModel.findOne({ _id: objectId(id), ...scope }).session(session);
      if (!order) fail('Order not found', 404);
      if (typeof status !== 'string' || !transitions[order.status]?.includes(status)) fail('Invalid order status transition', 409);
      const changed = await OrderModel.updateOne({ _id: order._id, status: order.status }, { $set: { status, lastStatusUpdateAt: new Date() } }, { session, runValidators: true });
      if (!changed.modifiedCount) fail('Order changed. Refresh and try again', 409);
      if (status === 'cancelled') {
        for (const item of order.items) await ProductModel.updateOne({ _id: item.product }, { $inc: { stock: item.quantity }, $set: { lastUpdatedAt: new Date() } }, { session });
        if (order.pickupSlot) await PickupSlotModel.updateOne({ _id: order.pickupSlot, booked: { $gt: 0 } }, { $inc: { booked: -1 } }, { session });
      }
    });
  } finally { await session.endSession(); }
  return serializeOrder(await OrderModel.findById(id));
}
