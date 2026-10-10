import mongoose, { type HydratedDocument } from 'mongoose';
import { OrderModel, type Order } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { PickupSlotModel } from '../models/PickupSlot.js';

// Only customer checkout orders reserve stock/capacity. Counter orders retain
// their existing behaviour. Transaction retries make cancellation idempotent.
export async function mutateCheckoutOrder(shopId: string, id: string, status?: string, remove = false) {
  let result: HydratedDocument<Order> | null = null;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await OrderModel.findOne({ _id: id, shop: shopId }).session(session);
      if (!order) { result = null; return; }
      const releasing = remove || status === 'cancelled';
      if (order.reservationReleased && status && status !== 'cancelled') {
        throw Object.assign(new Error('A cancelled checkout order cannot be reopened'), { status: 409 });
      }
      if (releasing && !order.reservationReleased && order.status !== 'picked-up') {
        for (const item of order.items) {
          await ProductModel.updateOne({ _id: item.product }, { $inc: { stock: item.quantity }, $set: { lastUpdatedAt: new Date() } }, { session });
        }
        await PickupSlotModel.updateOne({ _id: order.pickupSlot, booked: { $gt: 0 } }, { $inc: { booked: -1 } }, { session });
        order.reservationReleased = true;
      }
      if (status) {
        const transitions: Record<string, string[]> = { pending: ['accepted', 'preparing', 'cancelled'], accepted: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['picked-up', 'cancelled'], 'picked-up': [], cancelled: [] };
        if (status !== order.status && !transitions[order.status]?.includes(status)) {
          throw Object.assign(new Error('Invalid checkout order status transition'), { status: 409 });
        }
        order.status = status as typeof order.status;
        order.lastStatusUpdateAt = new Date();
      }
      result = order;
      if (remove) await order.deleteOne({ session });
      else await order.save({ session });
    });
    return result;
  } finally { await session.endSession(); }
}
