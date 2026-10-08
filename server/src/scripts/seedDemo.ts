import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "../config/environment.js";
import { UserModel } from "../models/User.js";
import { ShopModel } from "../models/Shop.js";
import { ProductModel } from "../models/Product.js";
import { CartModel } from "../models/Cart.js";
import { PickupSlotModel } from "../models/PickupSlot.js";
async function seed() {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI in server/.env");
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash("NeighbourDemo2026!", 12);
  const customer = await UserModel.findOneAndUpdate(
    { mobileNumber: "0771234567" },
    { $setOnInsert: { name: "Demo Customer", role: "customer", passwordHash } },
    { upsert: true, new: true },
  );
  const owner = await UserModel.findOneAndUpdate(
    { mobileNumber: "0777654321" },
    { $setOnInsert: { name: "Demo Shop Owner", role: "shop", passwordHash } },
    { upsert: true, new: true },
  );
  const shop = await ShopModel.findOneAndUpdate(
    { owner: owner._id, name: "Silva's Corner Grocery (Demo)" },
    {
      $set: { packingFee: 50, communityDiscount: 40 },
      $setOnInsert: {
        address: "Peradeniya Road, Kandy",
        acceptingOrders: true,
      },
    },
    { upsert: true, new: true },
  );
  const products = [];
  for (const p of [
    {
      name: "Highland Fresh Milk 1L",
      category: "Dairy",
      price: 480,
      stock: 30,
      available: true,
    },
    {
      name: "Anchor Fresh Milk 1L",
      category: "Dairy",
      price: 480,
      stock: 30,
      available: true,
    },
    {
      name: "Mysore Dhal 1kg",
      category: "Pulses",
      price: 340,
      stock: 30,
      available: true,
    },
    {
      name: "Red Onions 500g",
      category: "Vegetables",
      price: 290,
      stock: 0,
      available: false,
    },
    {
      name: "Bombay Big Onions 500g",
      category: "Vegetables",
      price: 240,
      stock: 30,
      available: true,
    },
  ])
    products.push(
      await ProductModel.findOneAndUpdate(
        { shop: shop._id, name: p.name },
        { $setOnInsert: p },
        { upsert: true, new: true },
      ),
    );
  await CartModel.findOneAndUpdate(
    { customer: customer._id },
    {
      $setOnInsert: {
        items: [
          { product: products[0]._id, quantity: 2 },
          { product: products[2]._id, quantity: 1 },
          { product: products[3]._id, quantity: 1 },
        ],
      },
    },
    { upsert: true },
  );
  for (let offset = 0; offset < 3; offset++) {
    const localDate = new Date(Date.now() + 330 * 60000 + offset * 86400000)
      .toISOString()
      .slice(0, 10);
    for (const [startTime, endTime] of [
      ["16:30", "17:00"],
      ["17:00", "17:30"],
      ["17:30", "18:00"],
      ["18:00", "18:30"],
      ["18:30", "19:00"],
      ["19:00", "19:30"],
    ]) {
      await PickupSlotModel.findOneAndUpdate(
        { shop: shop._id, date: new Date(localDate), startTime },
        { $setOnInsert: { endTime, capacity: 5, booked: 0 } },
        { upsert: true },
      );
    }
  }
  console.log("Demo data ready. Customer: 0771234567 / NeighbourDemo2026!");
}
seed()
  .catch(() => {
    console.error("Demo seed failed. Check database access and configuration.");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
