import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { setServers } from 'node:dns';
import type { Server } from 'node:http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { environment } from '../src/config/environment.js';
import { createApp } from '../src/app.js';
import { CartModel } from '../src/models/Cart.js';
import { OrderModel } from '../src/models/Order.js';
import { ProductModel } from '../src/models/Product.js';
import { PickupSlotModel } from '../src/models/PickupSlot.js';
import { ShopModel } from '../src/models/Shop.js';
import { UserModel } from '../src/models/User.js';
import { checkout, readCart, replaceItem, setCartItem } from '../src/services/cartService.js';
import { setOrderStatus, removeOrder } from '../src/services/orderService.js';
import { ensurePickupSlots } from '../src/services/member2PickupSlots.js';
import { quantity, slotStart } from '../src/services/checkoutRules.js';
import { completeHandoff, confirmPayment, proposeSubstitution, respondToSubstitution, verifyPickup } from '../src/services/orderWorkflowService.js';

let server: Server;
let url: string, customer: string, owner: string, shop: string, product: string, alternative: string, slot: string;
const dbName = `nm_member2_test_${Date.now()}`;
const models = [CartModel, OrderModel, ProductModel, PickupSlotModel, ShopModel, UserModel];
const headers = (id: string) => ({ Authorization: `Bearer ${jwt.sign({ purpose: 'session' }, environment.jwtSecret, { subject: id })}`, 'Content-Type': 'application/json' });
const body = (key = 'member2-checkout-test-0001') => ({ pickupSlotId: slot, checkoutKey: key, paymentMethod: 'cash', pickupNote: 'Counter pickup' });
before(async () => {
  setServers(['1.1.1.1', '8.8.8.8']);
  if (!environment.mongoUri) throw new Error('Set MONGO_URI in server/.env to run isolated integration tests');
  await mongoose.connect(environment.mongoUri, { dbName, serverSelectionTimeoutMS: 15000 });
  await Promise.all(models.map(m => m.init()));
  server = createApp().listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
beforeEach(async () => {
  await Promise.all(models.map(m => m.deleteMany({})));
  customer = (await UserModel.create({ name: 'Test customer', email: 'customer@example.test', location: 'Kandy', role: 'customer' })).id;
  owner = (await UserModel.create({ name: 'Test owner', email: 'owner@example.test', location: 'Kandy', role: 'shop' })).id;
  shop = (await ShopModel.create({ owner, name: 'Test shop', address: 'Kandy' })).id;
  product = (await ProductModel.create({ shop, name: 'Red onions', category: 'Vegetables', price: 290, stock: 10, imageUrl: 'https://example.test/onion.png' })).id;
  alternative = (await ProductModel.create({ shop, name: 'Big onions', category: 'Vegetables', price: 240, stock: 10 })).id;
  slot = (await PickupSlotModel.create({ shop, date: new Date(Date.now() + 86400000), startTime: '17:00', endTime: '17:30', capacity: 1 })).id;
});
after(async () => {
  if (server) await new Promise<void>(resolve => server.close(() => resolve()));
  if (mongoose.connection.name === dbName && mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test('quantity limits and pickup times use Colombo time', () => {
  for (const value of [0, -1, 1.5, '2', 100, null]) assert.throws(() => quantity(value));
  assert.equal(slotStart(new Date('2026-10-10'), '17:00').toISOString(), '2026-10-10T11:30:00.000Z');
});
test('cart persists preferences/images and refuses mixed shops or insufficient stock', async () => {
  await setCartItem(customer, product, 2, { enabled: true, type: 'auto', desc: 'Check expiry date' });
  const basket = await readCart(customer);
  assert.equal(basket.items[0].quantity, 2);
  assert.equal(basket.items[0].substitute?.desc, 'Check expiry date');
  assert.equal(basket.items[0].product.imageUrl, 'https://example.test/onion.png');
  await assert.rejects(setCartItem(customer, product, 11), /unavailable/);
  const other = await ProductModel.create({ shop: new mongoose.Types.ObjectId(), name: 'Other', category: 'Vegetables', price: 1, stock: 10 });
  await assert.rejects(setCartItem(customer, other.id, 1), /another shop/);
});
test('replacement approval merges quantities and uses actual prices', async () => {
  await setCartItem(customer, product, 2);
  await setCartItem(customer, alternative, 1);
  const basket = await replaceItem(customer, product, alternative);
  assert.equal(basket.items.length, 1);
  assert.equal(basket.items[0].quantity, 3);
  assert.equal(basket.total, 720);
  const milk = await ProductModel.create({ shop, name: 'Milk', category: 'Dairy', price: 100, stock: 10 });
  await assert.rejects(replaceItem(customer, alternative, milk.id), /same category/);
});
test('checkout hands customer order to existing shop workflow and customer API', async () => {
  await setCartItem(customer, product, 2);
  const order = await checkout(customer, body());
  assert.equal((await OrderModel.findById(order.id))!.customerName, 'Test customer');
  const shopResponse = await fetch(`${url}/api/orders/shop`, { headers: headers(owner) });
  const orders = await shopResponse.json();
  assert.equal(orders[0].id, order.id);
  assert.equal(orders[0].status, 'new');
  for (const status of ['preparing', 'ready', 'completed']) {
    const response = await fetch(`${url}/api/orders/${order.id}/status`, { method: 'PATCH', headers: headers(owner), body: JSON.stringify({ status }) });
    assert.equal(response.status, 200);
  }
  const mine = await fetch(`${url}/api/orders/mine`, { headers: headers(customer) });
  assert.equal((await mine.json())[0].status, 'picked-up');
  assert.equal((await ProductModel.findById(product))!.stock, 8);
});
test('concurrent retry checkout creates only one order and reservation', async () => {
  await setCartItem(customer, product, 1);
  const results = await Promise.all([checkout(customer, body()), checkout(customer, body())]);
  assert.equal(results[0].id, results[1].id);
  assert.equal(await OrderModel.countDocuments(), 1);
  assert.equal((await ProductModel.findById(product))!.stock, 9);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 1);
});
test('stock changes roll back slot reservation and preserve basket', async () => {
  await setCartItem(customer, product, 2);
  await ProductModel.updateOne({ _id: product }, { stock: 0 });
  await assert.rejects(checkout(customer, body()), /Stock changed/);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 0);
  assert.equal((await readCart(customer)).items.length, 1);
});
test('two customers cannot book the last pickup slot', async () => {
  const other = (await UserModel.create({ name: 'Other', email: 'other@example.test', location: 'Kandy', role: 'customer' })).id;
  await setCartItem(customer, product, 1); await setCartItem(other, product, 1);
  const results = await Promise.allSettled([checkout(customer, body()), checkout(other, body('member2-checkout-test-0002'))]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 1);
});
test('owner cancellation/deletion restores checkout reservations exactly once', async () => {
  await setCartItem(customer, product, 2); const order = await checkout(customer, body());
  await setOrderStatus(shop, order.id, 'cancelled');
  await setOrderStatus(shop, order.id, 'cancelled');
  await assert.rejects(setOrderStatus(shop, order.id, 'preparing'), /cannot be reopened/);
  await removeOrder(shop, order.id);
  assert.equal((await ProductModel.findById(product))!.stock, 10);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 0);
});
test('counter orders keep existing behaviour without checkout reservations', async () => {
  const order = await OrderModel.create({ customer: owner, shop, items: [{ product, name: 'Counter item', quantity: 2, unitPrice: 290 }], total: 580 });
  await setOrderStatus(shop, order.id, 'ready');
  await removeOrder(shop, order.id);
  assert.equal((await ProductModel.findById(product))!.stock, 10);
});
test('API enforces session/customer access and supports removal/clear', async () => {
  assert.equal((await fetch(`${url}/api/cart`)).status, 401);
  assert.equal((await fetch(`${url}/api/cart`, { headers: headers(owner) })).status, 403);
  const response = await fetch(`${url}/api/cart/items/${product}`, { method: 'PUT', headers: headers(customer), body: JSON.stringify({ quantity: 2 }) });
  assert.equal(response.status, 200);
  const removed = await fetch(`${url}/api/cart/items/${product}`, { method: 'DELETE', headers: headers(customer) });
  assert.equal((await removed.json()).items.length, 0);
  await setCartItem(customer, product, 1);
  const cleared = await fetch(`${url}/api/cart`, { method: 'DELETE', headers: headers(customer) });
  assert.equal((await cleared.json()).items.length, 0);
});
test('pickup slots follow owner hours and retain existing bookings', async () => {
  await ShopModel.updateOne({ _id: shop }, { openingTime: '16:00', closingTime: '18:00', activeOrdersCap: 4 });
  await ensurePickupSlots(shop);
  const count = await PickupSlotModel.countDocuments({ shop });
  await ensurePickupSlots(shop);
  assert.equal(await PickupSlotModel.countDocuments({ shop }), count);
  assert.equal((await PickupSlotModel.findById(slot))!.capacity, 1);
  assert.equal(await PickupSlotModel.countDocuments({ shop, startTime: '16:00', capacity: 4 }), 3);
});

test('customer and shop complete substitution, tracking, verification and handoff flow', async () => {
  await setCartItem(customer, product, 1);
  const created = await checkout(customer, body());
  await setOrderStatus(shop, created.id, 'preparing');
  await proposeSubstitution(shop, created.id, product, alternative, 'Fresh alternative from today');
  assert.equal((await ProductModel.findById(alternative))!.stock, 9);
  const detail = await fetch(`${url}/api/orders/${created.id}`, { headers: headers(customer) });
  assert.equal(detail.status, 200);
  assert.equal((await detail.json()).pendingSubstitutions, 1);
  await respondToSubstitution(customer, created.id, product, 'approved');
  await setOrderStatus(shop, created.id, 'ready');
  const order = await OrderModel.findById(created.id);
  await assert.rejects(verifyPickup(shop, created.id, 'wrong'), /Invalid pickup/);
  await verifyPickup(shop, created.id, order!.pickupCode!);
  await confirmPayment(shop, created.id);
  await completeHandoff(shop, created.id);
  const completed = await OrderModel.findById(created.id);
  assert.equal(completed!.status, 'picked-up');
  assert.equal(completed!.paymentStatus, 'paid');
  assert.ok(completed!.timeline.some(event => event.event === 'substitution-approved'));
  assert.ok(completed!.timeline.some(event => event.event === 'picked-up'));
});
