import mongoose from "mongoose";
import { randomBytes, randomInt } from "node:crypto";
import { CartModel } from "../models/Cart.js";
import { ProductModel } from "../models/Product.js";
import { ShopModel } from "../models/Shop.js";
import { OrderModel } from "../models/Order.js";
import { PickupSlotModel } from "../models/PickupSlot.js";
import { UserModel } from "../models/User.js";
import { money, quantity, slotStart } from "./checkoutRules.js";

export function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
function cleanPreference(value: unknown) {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object') fail('Invalid substitution preference');
  const v = value as Record<string, unknown>;
  if (typeof v.enabled !== 'boolean') fail('Invalid substitution preference');
  const out: any = { enabled: v.enabled };
  for (const field of ['title', 'desc', 'note']) {
    if (v[field] !== undefined) {
      if (typeof v[field] !== 'string' || (v[field] as string).length > 300) fail('Substitution notes must be at most 300 characters');
      out[field] = v[field];
    }
  }
  if (v.type !== undefined) {
    if (!['auto', 'manual'].includes(String(v.type))) fail('Invalid substitution type');
    out.type = v.type;
  }
  if (v.descType !== undefined) {
    if (!['success', 'warning', 'neutral'].includes(String(v.descType))) fail('Invalid substitution description');
    out.descType = v.descType;
  }
  return out;
}
export function objectId(value: unknown): string {
  if (typeof value !== "string" || !mongoose.isValidObjectId(value))
    fail("Invalid identifier");
  return value as string;
}
export async function readCart(customer: string) {
  const cart = await CartModel.findOne({ customer }).populate("items.product");
  const items = (cart?.items ?? [])
    .filter((i) => i.product)
    .map((i) => {
      const p = i.product as any;
      return {
        product: {
          id: p.id,
          name: p.name,
          price: p.price,
          available: p.available,
          stock: p.stock,
          shopId: String(p.shop),
          category: p.category,
          imageUrl: p.imageUrl,
        },
        quantity: i.quantity,
        substitute: i.substitute,
        needsReplacement: !p.available || p.stock < i.quantity,
      };
    });
  const shop = items.length
    ? await ShopModel.findById(items[0].product.shopId)
    : null;
  const subtotal = money(
    items.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
  );
  const packingFee = shop?.packingFee ?? 0;
  const communityDiscount = Math.min(
    subtotal + packingFee,
    shop?.communityDiscount ?? 0,
  );
  return {
    items,
    subtotal,
    packingFee,
    communityDiscount,
    total: money(subtotal + packingFee - communityDiscount),
    shop: shop ? { id: shop.id, name: shop.name, address: shop.address } : null,
  };
}
export async function setCartItem(
  customer: string,
  productId: string,
  amount: unknown,
  preference?: unknown,
) {
  const q = quantity(amount);
  const substitute = cleanPreference(preference);
  const product = await ProductModel.findById(objectId(productId));
  if (!product) fail("Product not found", 404);
  const cart = await CartModel.findOneAndUpdate(
    { customer },
    { $setOnInsert: { customer, items: [] } },
    { upsert: true, new: true },
  );
  const existingProducts = await ProductModel.find({
    _id: { $in: cart.items.map((i) => i.product) },
  });
  if (existingProducts.some((p) => !p.shop.equals(product.shop)))
    fail("Clear your basket before shopping at another shop");
  if (!product.available || product.stock < q)
    fail("Requested quantity is unavailable", 409);
  const existing = cart.items.find((i) => String(i.product) === productId);
  if (existing) existing.quantity = q;
  else cart.items.push({ product: product._id, quantity: q });
  if (substitute !== undefined) cart.items.find((i) => String(i.product) === productId)!.substitute = substitute;
  await cart.save();
  return readCart(customer);
}
export async function replaceItem(
  customer: string,
  originalId: string,
  replacementId: string,
) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const cart = await CartModel.findOne({ customer }).session(session);
      const item = cart?.items.find((i) => String(i.product) === originalId);
      if (!cart || !item) fail("Basket item not found", 404);
      const original = await ProductModel.findById(
        objectId(originalId),
      ).session(session);
      const replacement = await ProductModel.findById(
        objectId(replacementId),
      ).session(session);
      if (
        !original ||
        !replacement ||
        !original.shop.equals(replacement.shop) ||
        original.category !== replacement.category ||
        original.id === replacement.id
      )
        fail("Choose a replacement in the same category and shop");
      const existing = cart.items.find(
        (i) => String(i.product) === replacementId,
      );
      const q = item.quantity + (existing?.quantity ?? 0);
      if (!replacement.available || replacement.stock < q || q > 99)
        fail("Replacement is unavailable", 409);
      if (existing) {
        existing.quantity = q;
        cart.items.pull(item._id);
      } else item.product = replacement._id;
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return readCart(customer);
}
export async function checkout(customer: string, body: any) {
  const slotId = objectId(body.pickupSlotId);
  if (
    typeof body.checkoutKey !== "string" ||
    !/^[\w-]{16,100}$/.test(body.checkoutKey)
  )
    fail("A checkout key is required");
  if (!["cash", "card", "lankaqr"].includes(body.paymentMethod))
    fail("Choose a payment method");
  if (
    body.pickupNote !== undefined &&
    (typeof body.pickupNote !== "string" || body.pickupNote.length > 300)
  )
    fail("Pickup note must be at most 300 characters");
  let result: any;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const previous = await OrderModel.findOne({
        customer,
        checkoutKey: body.checkoutKey,
      }).session(session);
      if (previous) {
        result = previous;
        return;
      }
      const cart = await CartModel.findOne({ customer }).session(session);
      const customerUser = await UserModel.findById(customer).session(session);
      if (!cart?.items.length) fail("Your basket is empty");
      const slot = await PickupSlotModel.findById(slotId).session(session);
      if (!slot || slotStart(slot.date, slot.startTime) <= new Date())
        fail("Choose a future pickup slot", 409);
      const shop = await ShopModel.findById(slot.shop).session(session);
      if (!shop?.acceptingOrders) fail("Shop is not accepting orders", 409);
      const reserved = await PickupSlotModel.updateOne(
        { _id: slotId, $expr: { $lt: ["$booked", "$capacity"] } },
        { $inc: { booked: 1 } },
        { session },
      );
      if (!reserved.modifiedCount)
        fail("That time slot is full. Please choose another", 409);
      const items = [];
      for (const item of cart.items) {
        const product = await ProductModel.findOneAndUpdate(
          {
            _id: item.product,
            shop: slot.shop,
            available: true,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
            $set: { lastUpdatedAt: new Date() },
          },
          { session, new: true },
        );
        if (!product)
          fail("Stock changed. Review your basket and replacements", 409);
        items.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          imageUrl: product.imageUrl,
          substitutionPreference: item.substitute?.enabled ? item.substitute.desc : undefined,
        });
      }
      [result] = await OrderModel.create(
        [
          {
            customer,
            customerName: customerUser?.name,
            shop: slot.shop,
            pickupSlot: slot._id,
            items,
            packingFee: shop.packingFee ?? 0,
            communityDiscount: Math.min(
              items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) +
                (shop.packingFee ?? 0),
              shop.communityDiscount ?? 0,
            ),
            total: money(
              Math.max(
                0,
                items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) +
                  (shop.packingFee ?? 0) -
                  (shop.communityDiscount ?? 0),
              ),
            ),
            checkoutKey: body.checkoutKey,
            pickupNote: body.pickupNote,
            paymentMethod: body.paymentMethod,
            paymentStatus: 'pending',
            pickupCode: String(randomInt(100000, 1000000)),
            pickupPassToken: randomBytes(24).toString('hex'),
            timeline: [{
              event: 'order-received',
              label: 'Order Received',
              description: 'Your order was received successfully.',
              actor: 'system',
              occurredAt: new Date(),
            }],
          },
        ],
        { session },
      );
      cart.items.splice(0);
      await cart.save({ session });
    });
  } catch (error: any) {
    if (error.code !== 11000) throw error;
    result = await OrderModel.findOne({
      customer,
      checkoutKey: body.checkoutKey,
    });
    if (!result) throw error;
  } finally {
    await session.endSession();
  }
  return { id: result.id, status: result.status, total: result.total, pickupCode: result.pickupCode };
}
