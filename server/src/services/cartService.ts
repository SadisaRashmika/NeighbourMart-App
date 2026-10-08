import mongoose from 'mongoose';
import { CartModel } from '../models/Cart.js';
import { ProductModel } from '../models/Product.js';
import { ShopModel } from '../models/Shop.js';
import { OrderModel } from '../models/Order.js';
import { PickupSlotModel } from '../models/PickupSlot.js';
import { money, quantity, slotStart } from './checkoutRules.js';

export function fail(message: string, status = 400): never { throw Object.assign(new Error(message), { status }); }
export function objectId(value: unknown): string {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) fail('Invalid identifier');
  return value as string;
}
export async function readCart(customer: string) {
  const cart = await CartModel.findOne({ customer }).populate('items.product');
  const items = (cart?.items ?? []).filter(i => i.product).map(i => {
    const p = i.product as any;
    return { product: { id: p.id, name: p.name, price: p.price, available: p.available, stock: p.stock, shopId: String(p.shop), category: p.category },
      quantity: i.quantity, needsReplacement: !p.available || p.stock < i.quantity };
  });
  const shop = items.length ? await ShopModel.findById(items[0].product.shopId) : null;
  return { items, total: money(items.reduce((sum, i) => sum + i.quantity * i.product.price, 0)),
    shop: shop ? { id: shop.id, name: shop.name, address: shop.address } : null };
}
export async function setCartItem(customer: string, productId: string, amount: unknown) {
  const q = quantity(amount);
  const product = await ProductModel.findById(objectId(productId));
  if (!product) fail('Product not found', 404);
  const cart = await CartModel.findOneAndUpdate({ customer }, { $setOnInsert: { customer, items: [] } }, { upsert: true, new: true });
  const existingProducts = await ProductModel.find({ _id: { $in: cart.items.map(i => i.product) } });
  if (existingProducts.some(p => !p.shop.equals(product.shop))) fail('Clear your basket before shopping at another shop');
  if (!product.available || product.stock < q) fail('Requested quantity is unavailable', 409);
  const existing = cart.items.find(i => String(i.product) === productId);
  if (existing) existing.quantity = q;
  else cart.items.push({ product: product._id, quantity: q });
  await cart.save();
  return readCart(customer);
}
export async function replaceItem(customer: string, originalId: string, replacementId: string) {
  const session = await mongoose.startSession();
  try { await session.withTransaction(async () => {
    const cart = await CartModel.findOne({ customer }).session(session);
    const item = cart?.items.find(i => String(i.product) === originalId);
    if (!cart || !item) fail('Basket item not found', 404);
    const original = await ProductModel.findById(objectId(originalId)).session(session);
    const replacement = await ProductModel.findById(objectId(replacementId)).session(session);
    if (!original || !replacement || !original.shop.equals(replacement.shop) || original.category !== replacement.category || original.id === replacement.id) fail('Choose a replacement in the same category and shop');
    const existing = cart.items.find(i => String(i.product) === replacementId);
    const q = item.quantity + (existing?.quantity ?? 0);
    if (!replacement.available || replacement.stock < q || q > 99) fail('Replacement is unavailable', 409);
    if (existing) { existing.quantity = q; cart.items.pull(item._id); }
    else item.product = replacement._id;
    await cart.save({ session });
  }); } finally { await session.endSession(); }
  return readCart(customer);
}
export async function checkout(customer: string, body: any) {
  const slotId = objectId(body.pickupSlotId);
  if (typeof body.checkoutKey !== 'string' || !/^[\w-]{16,100}$/.test(body.checkoutKey)) fail('A checkout key is required');
  if (!['cash', 'card', 'lankaqr'].includes(body.paymentMethod)) fail('Choose a payment method');
  if (body.pickupNote !== undefined && (typeof body.pickupNote !== 'string' || body.pickupNote.length > 300)) fail('Pickup note must be at most 300 characters');
  let result: any;
  const session = await mongoose.startSession();
  try { await session.withTransaction(async () => {
    const previous = await OrderModel.findOne({ customer, checkoutKey: body.checkoutKey }).session(session);
    if (previous) { result = previous; return; }
    const cart = await CartModel.findOne({ customer }).session(session);
    if (!cart?.items.length) fail('Your basket is empty');
    const slot = await PickupSlotModel.findById(slotId).session(session);
    if (!slot || slotStart(slot.date, slot.startTime) <= new Date()) fail('Choose a future pickup slot', 409);
    const shop = await ShopModel.findById(slot.shop).session(session);
    if (!shop?.acceptingOrders) fail('Shop is not accepting orders', 409);
    const reserved = await PickupSlotModel.updateOne({ _id: slotId, $expr: { $lt: ['$booked', '$capacity'] } }, { $inc: { booked: 1 } }, { session });
    if (!reserved.modifiedCount) fail('That time slot is full. Please choose another', 409);
    const items = [];
    for (const item of cart.items) {
      const product = await ProductModel.findOneAndUpdate({ _id: item.product, shop: slot.shop, available: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity }, $set: { lastUpdatedAt: new Date() } }, { session, new: true });
      if (!product) fail('Stock changed. Review your basket and replacements', 409);
      items.push({ product: product._id, name: product.name, quantity: item.quantity, unitPrice: product.price });
    }
    [result] = await OrderModel.create([{ customer, shop: slot.shop, pickupSlot: slot._id, items,
      total: money(items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)),
      checkoutKey: body.checkoutKey, pickupNote: body.pickupNote, paymentMethod: body.paymentMethod }], { session });
    cart.items.splice(0); await cart.save({ session });
  }); } catch (error: any) {
    if (error.code !== 11000) throw error;
    result = await OrderModel.findOne({ customer, checkoutKey: body.checkoutKey });
    if (!result) throw error;
  } finally { await session.endSession(); }
  return { id: result.id, status: result.status, total: result.total };
}
