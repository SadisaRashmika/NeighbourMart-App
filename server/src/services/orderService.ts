import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { mutateCheckoutOrder } from './member2OrderReservations.js';

export function findOrdersByCustomer(customerId: string) {
  return OrderModel.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
}
export function findOrdersByShop(shopId: string) {
  return OrderModel.find({ shop: shopId }).sort({ createdAt: -1 }).lean();
}

// Server status <-> shop-owner screen status
const TO_UI: Record<string, string> = { pending: 'new', accepted: 'preparing', preparing: 'preparing', ready: 'ready', 'picked-up': 'completed', cancelled: 'cancelled' };
export const FROM_UI: Record<string, string> = { new: 'pending', preparing: 'preparing', ready: 'ready', completed: 'picked-up', cancelled: 'cancelled' };

export function toShopOrderDto(o: {
  _id: unknown; customerName?: string | null; status: string; total: number; createdAt?: Date;
  items: { name: string; quantity: number; unitPrice: number }[];
  pickupSlot?: unknown; paymentMethod?: string | null; paymentStatus?: string | null;
}) {
  const id = String(o._id);
  return {
    id, orderNumber: `NM-${id.slice(-4).toUpperCase()}`, customerName: o.customerName || 'Customer',
    status: TO_UI[o.status] ?? 'new', total: o.total, createdAt: o.createdAt,
    items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    pickupSlot: o.pickupSlot, paymentMethod: o.paymentMethod ?? 'cash',
    paymentStatus: o.paymentStatus ?? (o.status === 'picked-up' ? 'paid' : 'pending'),
    pendingSubstitutions: o.items.filter((i: any) => i.substitution?.status === 'pending').length,
  };
}

export async function createCounterOrder(shop: { _id: unknown; owner: unknown }, customerName: string, lines: { productId: string; quantity: number }[]) {
  const products = await ProductModel.find({ _id: { $in: lines.map((l) => l.productId) }, shop: shop._id });
  const items = lines.flatMap((l) => {
    const p = products.find((x) => String(x._id) === l.productId);
    return p ? [{ product: p._id, name: p.name, quantity: l.quantity, unitPrice: p.price }] : [];
  });
  if (!items.length) return null;
  const total = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);
  return OrderModel.create({ customer: shop.owner, customerName, shop: shop._id, items, total, status: 'pending' });
}
export async function setOrderStatus(shopId: string, id: string, uiStatus: string) {
  if (await OrderModel.exists({ _id: id, shop: shopId, checkoutKey: { $type: 'string' } })) {
    return mutateCheckoutOrder(shopId, id, FROM_UI[uiStatus]);
  }
  return OrderModel.findOneAndUpdate({ _id: id, shop: shopId }, { status: FROM_UI[uiStatus], lastStatusUpdateAt: new Date() }, { new: true });
}
export async function removeOrder(shopId: string, id: string) {
  if (await OrderModel.exists({ _id: id, shop: shopId, checkoutKey: { $type: 'string' } })) {
    return mutateCheckoutOrder(shopId, id, undefined, true);
  }
  return OrderModel.findOneAndDelete({ _id: id, shop: shopId });
}
