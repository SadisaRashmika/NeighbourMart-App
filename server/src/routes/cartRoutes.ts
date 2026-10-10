import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { CartModel } from "../models/Cart.js";
import { ProductModel } from "../models/Product.js";
import { PickupSlotModel } from "../models/PickupSlot.js";
import {
  checkout,
  fail,
  objectId,
  readCart,
  replaceItem,
  setCartItem,
} from "../services/cartService.js";
import { ensurePickupSlots } from "../services/member2PickupSlots.js";
import { slotStart } from "../services/checkoutRules.js";
const router = Router();
router.use(authMiddleware);
router.use((_req, res, next) => {
  if (res.locals.userRole !== "customer") {
    res.status(403).json({ message: "Customer access required" });
    return;
  }
  next();
});
router.get("/", async (_req, res) => {
  res.json(await readCart(res.locals.userId));
});
router.put("/items/:productId", async (req, res) => {
  res.json(
    await setCartItem(
      res.locals.userId,
      String(req.params.productId),
      req.body?.quantity,
      req.body?.substitute,
    ),
  );
});
router.delete("/items/:productId", async (req, res) => {
  await CartModel.updateOne(
    { customer: res.locals.userId },
    { $pull: { items: { product: objectId(req.params.productId) } } },
  );
  res.json(await readCart(res.locals.userId));
});
router.delete("/", async (_req, res) => {
  await CartModel.updateOne(
    { customer: res.locals.userId },
    { $set: { items: [] } },
  );
  res.json(await readCart(res.locals.userId));
});
router.get("/items/:productId/replacements", async (req, res) => {
  const id = objectId(req.params.productId);
  const cart = await CartModel.findOne({
    customer: res.locals.userId,
    "items.product": id,
  });
  if (!cart) fail("Basket item not found", 404);
  const original = await ProductModel.findById(id);
  if (!original) fail("Product not found", 404);
  const amount = cart.items.find((i) => String(i.product) === id)!.quantity;
  const products = await ProductModel.find({
    _id: { $ne: id },
    shop: original.shop,
    category: original.category,
    available: true,
    stock: { $gte: amount },
  });
  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      available: p.available,
      shopId: String(p.shop),
      category: p.category,
    })),
  );
});
router.post("/items/:productId/replacement", async (req, res) => {
  res.json(
    await replaceItem(
      res.locals.userId,
      objectId(req.params.productId),
      objectId(req.body?.replacementId),
    ),
  );
});
router.get("/pickup-slots", async (_req, res) => {
  const cart = await readCart(res.locals.userId);
  if (!cart.shop) {
    res.json([]);
    return;
  }
  await ensurePickupSlots(cart.shop.id);
  const slots = await PickupSlotModel.find({ shop: cart.shop.id }).sort({
    date: 1,
    startTime: 1,
  });
  res.json(
    slots
      .filter((s) => slotStart(s.date, s.startTime) > new Date())
      .map((s) => ({
        id: s.id,
        date: s.date.toISOString().slice(0, 10),
        startTime: s.startTime,
        endTime: s.endTime,
        remaining: Math.max(0, s.capacity - s.booked),
      })),
  );
});
router.post("/checkout", async (req, res) => {
  res.status(201).json(await checkout(res.locals.userId, req.body ?? {}));
});
export default router;
