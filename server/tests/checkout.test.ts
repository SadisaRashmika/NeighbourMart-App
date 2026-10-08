import { after, before, beforeEach, test } from "node:test";
import '../src/config/environment.js';
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Server } from "node:http";
import { createApp } from "../src/app.js";
import { CartModel } from "../src/models/Cart.js";
import { OrderModel } from "../src/models/Order.js";
import { ProductModel } from "../src/models/Product.js";
import { PickupSlotModel } from "../src/models/PickupSlot.js";
import { ShopModel } from "../src/models/Shop.js";
import { UserModel } from "../src/models/User.js";
import {
  checkout,
  readCart,
  replaceItem,
  setCartItem,
} from "../src/services/cartService.js";
import { quantity, slotStart } from "../src/services/checkoutRules.js";
let db: MongoMemoryReplSet;
let server: Server;
let url: string;
let customer: string;
let shop: string;
let product: string;
let alternative: string;
let slot: string;
const body = (key = "test-checkout-key-0001") => ({
  pickupSlotId: slot,
  checkoutKey: key,
  paymentMethod: "cash",
  pickupNote: "Counter pickup",
});
before(async () => {
  process.env.JWT_SECRET = "isolated-test-secret-that-is-not-a-real-credential";
  if (process.env.TEST_MONGO_URI) {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      dbName: `neighbourmart_test_${Date.now()}`,
      serverSelectionTimeoutMS: 10000,
    });
  } else {
    db = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(db.getUri());
  }
  await Promise.all([
    CartModel.init(),
    OrderModel.init(),
    UserModel.init(),
    ShopModel.init(),
    ProductModel.init(),
    PickupSlotModel.init(),
  ]);
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  url = `http://127.0.0.1:${(server.address() as any).port}`;
});
beforeEach(async () => {
  await Promise.all(
    [
      CartModel,
      OrderModel,
      ProductModel,
      PickupSlotModel,
      ShopModel,
      UserModel,
    ].map((m) => m.deleteMany({})),
  );
  customer = (
    await UserModel.create({
      name: "Test customer",
      mobileNumber: "0771234567",
      role: "customer",
    })
  ).id;
  shop = (
    await ShopModel.create({
      owner: new mongoose.Types.ObjectId(),
      name: "Test shop",
      address: "Kandy",
    })
  ).id;
  product = (
    await ProductModel.create({
      shop,
      name: "Red onions",
      category: "Vegetables",
      price: 290,
      stock: 10,
    })
  ).id;
  alternative = (
    await ProductModel.create({
      shop,
      name: "Big onions",
      category: "Vegetables",
      price: 240,
      stock: 10,
    })
  ).id;
  slot = (
    await PickupSlotModel.create({
      shop,
      date: new Date(Date.now() + 2 * 86400000),
      startTime: "17:00",
      endTime: "17:30",
      capacity: 1,
    })
  ).id;
});
after(async () => {
  if (server)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  if (process.env.TEST_MONGO_URI && mongoose.connection.readyState === 1)
    await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (db) await db.stop();
});
test("rejects invalid quantities and uses Colombo time for slots", () => {
  for (const value of [0, -1, 1.5, "2", 100, null])
    assert.throws(() => quantity(value));
  assert.equal(
    slotStart(new Date("2026-10-09"), "17:00").toISOString(),
    "2026-10-09T11:30:00.000Z",
  );
});
test("password login returns a usable token and rejects wrong passwords", async () => {
  await UserModel.updateOne(
    { _id: customer },
    { passwordHash: await bcrypt.hash("test-password", 4) },
  );
  const login = (password: string) =>
    fetch(`${url}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: "0771234567", password }),
    });
  assert.equal((await login("wrong")).status, 401);
  const response = await login("test-password");
  assert.equal(response.status, 200);
  const session = await response.json();
  const me = await fetch(`${url}/api/auth/me`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  assert.equal((await me.json()).id, customer);
  assert.equal(session.passwordHash, undefined);
});
test("same-customer concurrent checkout retries cannot create duplicate orders", async () => {
  await setCartItem(customer, product, 1);
  const results = await Promise.all([
    checkout(customer, body()),
    checkout(customer, body()),
  ]);
  assert.equal(results[0].id, results[1].id);
  assert.equal(await OrderModel.countDocuments(), 1);
  assert.equal((await ProductModel.findById(product))!.stock, 9);
});
test("packing fees and discounts agree between basket and confirmed order", async () => {
  await ShopModel.updateOne(
    { _id: shop },
    { packingFee: 50, communityDiscount: 40 },
  );
  await setCartItem(customer, product, 2);
  const basket = await readCart(customer);
  assert.equal(basket.subtotal, 580);
  assert.equal(basket.total, 590);
  const result = await checkout(customer, {
    ...body(),
    packingFee: 0,
    communityDiscount: 999,
  });
  assert.equal(result.total, basket.total);
  const order = await OrderModel.findById(result.id);
  assert.equal(order!.packingFee, 50);
  assert.equal(order!.communityDiscount, 40);
});
test("cart quantity edits persist and total is calculated from product prices", async () => {
  await setCartItem(customer, product, 2);
  const cart = await setCartItem(customer, product, 3);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.total, 870);
  await assert.rejects(setCartItem(customer, product, 11), /unavailable/);
});
test("replacement approval updates the product and price; wrong category is rejected", async () => {
  await setCartItem(customer, product, 2);
  const cart = await replaceItem(customer, product, alternative);
  assert.equal(cart.total, 480);
  assert.equal(cart.items[0].product.id, alternative);
  const milk = await ProductModel.create({
    shop,
    name: "Milk",
    category: "Dairy",
    price: 100,
    stock: 10,
  });
  await assert.rejects(
    replaceItem(customer, alternative, milk.id),
    /same category/,
  );
});
test("checkout reserves stock and capacity, clears cart, and retries return the same order", async () => {
  await setCartItem(customer, product, 2);
  const first = await checkout(customer, { ...body(), total: 1 });
  const second = await checkout(customer, body());
  assert.equal(first.id, second.id);
  assert.equal(first.total, 580);
  assert.equal(await OrderModel.countDocuments(), 1);
  assert.equal((await ProductModel.findById(product))!.stock, 8);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 1);
  assert.equal((await readCart(customer)).items.length, 0);
});
test("stock failure rolls back the slot booking and preserves the basket", async () => {
  await setCartItem(customer, product, 2);
  await ProductModel.updateOne({ _id: product }, { stock: 0 });
  await assert.rejects(checkout(customer, body()), /Stock changed/);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 0);
  assert.equal((await readCart(customer)).items.length, 1);
  assert.equal(await OrderModel.countDocuments(), 0);
});
test("concurrent customers cannot overbook the last slot", async () => {
  const other = (
    await UserModel.create({
      name: "Other",
      mobileNumber: "0771111111",
      role: "customer",
    })
  ).id;
  await setCartItem(customer, product, 1);
  await setCartItem(other, product, 1);
  const results = await Promise.allSettled([
    checkout(customer, body()),
    checkout(other, body("test-checkout-key-0002")),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await PickupSlotModel.findById(slot))!.booked, 1);
  assert.equal((await ProductModel.findById(product))!.stock, 9);
});
test("past slots and slots belonging to another shop are rejected", async () => {
  await setCartItem(customer, product, 1);
  await PickupSlotModel.updateOne(
    { _id: slot },
    { date: new Date("2020-01-01") },
  );
  await assert.rejects(checkout(customer, body()), /future pickup/);
  await PickupSlotModel.updateOne(
    { _id: slot },
    {
      date: new Date(Date.now() + 86400000),
      shop: new mongoose.Types.ObjectId(),
    },
  );
  await assert.rejects(checkout(customer, body()), /not accepting orders/);
});
test("API requires authentication, isolates baskets, and supports reject/remove and clear", async () => {
  assert.equal((await fetch(`${url}/api/cart`)).status, 401);
  const token = jwt.sign({}, process.env.JWT_SECRET!, { subject: customer });
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const put = await fetch(`${url}/api/cart/items/${product}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ quantity: 2 }),
  });
  assert.equal(put.status, 200);
  const other = (
    await UserModel.create({
      name: "Other",
      mobileNumber: "0771111111",
      role: "customer",
    })
  ).id;
  assert.equal((await readCart(other)).items.length, 0);
  const removed = await fetch(`${url}/api/cart/items/${product}`, {
    method: "DELETE",
    headers,
  });
  assert.equal((await removed.json()).items.length, 0);
  await setCartItem(customer, alternative, 1);
  const cleared = await fetch(`${url}/api/cart`, { method: "DELETE", headers });
  assert.equal((await cleared.json()).items.length, 0);
});
