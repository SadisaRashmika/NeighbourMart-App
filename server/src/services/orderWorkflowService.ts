import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { PickupSlotModel } from '../models/PickupSlot.js';
import { mutateCheckoutOrder } from './member2OrderReservations.js';

const fail = (message: string, status = 400): never => { throw Object.assign(new Error(message), { status }); };
const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
const timeline = (event: string, label: string, actor: 'customer' | 'shop' | 'system', description?: string) => ({ event, label, actor, description, occurredAt: new Date() });

export async function ensurePickupPass(order: any) {
  let changed = false;
  if (!order.pickupCode) { order.pickupCode = String(randomInt(100000, 1000000)); changed = true; }
  if (!order.pickupPassToken) { order.pickupPassToken = randomBytes(24).toString('hex'); changed = true; }
  if (!order.timeline?.length) { order.timeline = [timeline('order-received', 'Order Received', 'system', 'Your order was received successfully.')]; changed = true; }
  if (changed) await order.save();
  return order;
}

export async function cancelCustomerOrder(customerId: string, orderId: string) {
  const order: any = await OrderModel.findOne({ _id: orderId, customer: customerId });
  if (!order) fail('Order not found', 404);
  if (!['pending', 'accepted'].includes(order.status)) fail('This order can no longer be cancelled', 409);
  const result: any = await mutateCheckoutOrder(String(order.shop), orderId, 'cancelled');
  if (!result) fail('Order not found', 404);
  result.timeline.push(timeline('cancelled', 'Order Cancelled', 'customer', 'The customer cancelled this order') as any);
  await result.save();
  return result;
}

export async function proposeSubstitution(shopId: string, orderId: string, productId: string, replacementId: string, note?: string) {
  const session = await mongoose.startSession();
  try {
    let output: any;
    await session.withTransaction(async () => {
      const order: any = await OrderModel.findOne({ _id: orderId, shop: shopId }).session(session);
      if (!order) fail('Order not found', 404);
      if (!['accepted', 'preparing'].includes(order.status)) fail('Substitutions are only available while preparing an order', 409);
      const item: any = order.items.find((line: any) => String(line.product) === productId);
      if (!item) fail('Order item not found', 404);
      if (item.substitution?.status === 'pending') fail('A substitution is already awaiting approval', 409);
      const original = await ProductModel.findOne({ _id: productId, shop: shopId }).session(session);
      const replacement: any = await ProductModel.findOneAndUpdate(
        { _id: replacementId, shop: shopId, available: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity }, $set: { lastUpdatedAt: new Date() } },
        { new: true, session },
      );
      if (!original || !replacement || original.category !== replacement.category || productId === replacementId) fail('Choose an available replacement from the same category', 409);
      const now = new Date();
      item.substitution = {
        status: 'pending', suggestedProduct: replacement._id, suggestedName: replacement.name,
        suggestedImageUrl: replacement.imageUrl, suggestedUnitPrice: replacement.price,
        priceDifference: (replacement.price - item.unitPrice) * item.quantity,
        shopkeeperNote: note?.trim(), requestedAt: now, expiresAt: new Date(now.getTime() + 5 * 60_000),
      } as any;
      order.timeline.push(timeline('substitution-requested', 'Substitution Approval Required', 'shop', `${item.name} needs a replacement`) as any);
      await order.save({ session }); output = order;
    });
    return output;
  } finally { await session.endSession(); }
}

export async function respondToSubstitution(customerId: string, orderId: string, productId: string, decision: string) {
  if (!['approved', 'rejected'].includes(decision)) fail('Decision must be approved or rejected');
  const session = await mongoose.startSession();
  try {
    let output: any;
    await session.withTransaction(async () => {
      const order: any = await OrderModel.findOne({ _id: orderId, customer: customerId }).session(session);
      if (!order) fail('Order not found', 404);
      const index = order.items.findIndex((line: any) => String(line.product) === productId);
      const item: any = order.items[index];
      if (!item || item.substitution?.status !== 'pending' || !item.substitution.suggestedProduct) fail('Pending substitution not found', 409);
      if (decision === 'approved') {
        item.product = item.substitution.suggestedProduct;
        item.name = item.substitution.suggestedName || item.name;
        item.imageUrl = item.substitution.suggestedImageUrl;
        item.unitPrice = item.substitution.suggestedUnitPrice ?? item.unitPrice;
        item.substitution.status = 'approved'; item.substitution.respondedAt = new Date();
        order.timeline.push(timeline('substitution-approved', 'Substitution Approved', 'customer', item.name) as any);
      } else {
        await ProductModel.updateOne({ _id: item.substitution.suggestedProduct }, { $inc: { stock: item.quantity }, $set: { lastUpdatedAt: new Date() } }, { session });
        order.items.splice(index, 1);
        order.timeline.push(timeline('substitution-rejected', 'Substitution Rejected', 'customer', `${item.name} was removed from the order`) as any);
      }
      const subtotal = order.items.reduce((sum: number, line: any) => sum + line.quantity * line.unitPrice, 0);
      order.communityDiscount = Math.min(subtotal + order.packingFee, order.communityDiscount);
      order.total = Math.max(0, subtotal + order.packingFee - order.communityDiscount);
      if (!order.items.length) {
        order.status = 'cancelled'; order.reservationReleased = true;
        await PickupSlotModel.updateOne({ _id: order.pickupSlot, booked: { $gt: 0 } }, { $inc: { booked: -1 } }, { session });
        order.timeline.push(timeline('cancelled', 'Order Cancelled', 'system', 'No items remained after the substitution decision') as any);
      }
      await order.save({ session }); output = order;
    });
    return output;
  } finally { await session.endSession(); }
}

export async function verifyPickup(shopId: string, orderId: string, value: string) {
  const order: any = await OrderModel.findOne({ _id: orderId, shop: shopId });
  if (!order) fail('Order not found', 404);
  if (order.status !== 'ready') fail('Order is not ready for pickup', 409);
  if (!value || (!safeEqual(value, order.pickupCode ?? '') && !safeEqual(value, order.pickupPassToken ?? ''))) fail('Invalid pickup code or pass', 400);
  if (!order.pickupVerifiedAt) {
    order.pickupVerifiedAt = new Date();
    order.timeline.push(timeline('pickup-verified', 'Pickup Pass Verified', 'shop') as any);
    await order.save();
  }
  return order;
}

export async function confirmPayment(shopId: string, orderId: string) {
  const order: any = await OrderModel.findOne({ _id: orderId, shop: shopId });
  if (!order) fail('Order not found', 404);
  if (order.status !== 'ready') fail('Order is not ready for settlement', 409);
  if (order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.timeline.push(timeline('payment-confirmed', 'Payment Confirmed', 'shop', `Paid by ${order.paymentMethod ?? 'cash'}`) as any);
    await order.save();
  }
  return order;
}

export async function completeHandoff(shopId: string, orderId: string) {
  const order: any = await OrderModel.findOne({ _id: orderId, shop: shopId });
  if (!order) fail('Order not found', 404);
  if (!order.pickupVerifiedAt) fail('Verify the pickup pass first', 409);
  if (order.paymentStatus !== 'paid') fail('Confirm payment before completing handoff', 409);
  const result: any = await mutateCheckoutOrder(shopId, orderId, 'picked-up');
  if (!result) fail('Order not found', 404);
  result.pickedUpAt = new Date();
  result.timeline.push(timeline('picked-up', 'Order Picked Up', 'shop', 'The order was handed to the customer') as any);
  await result.save();
  return result;
}
