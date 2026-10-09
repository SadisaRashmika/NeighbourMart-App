import { Router } from 'express';
import { orderScope, serializeOrder, updateOrderStatus } from '../services/orderIntegration.js';
import { fail, objectId } from '../services/cartService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { OrderModel } from '../models/Order.js';

const router = Router();

router.use(authMiddleware);
router.get('/mine', async (_req, res) => {
  if (res.locals.user.role !== 'customer') fail('Customer access required', 403);
  const orders = await OrderModel.find({ customer: res.locals.user.id }).sort({ createdAt: -1 });
  res.json(await Promise.all(orders.map(serializeOrder)));
});
router.get('/shop', async (_req, res) => {
  if (res.locals.user.role !== 'shop') fail('Shop owner access required', 403);
  const orders = await OrderModel.find(await orderScope(res.locals.user)).sort({ createdAt: -1 });
  res.json(await Promise.all(orders.map(serializeOrder)));
});
router.get('/:id', async (req, res) => {
  const order = await OrderModel.findOne({ _id: objectId(req.params.id), ...await orderScope(res.locals.user) });
  if (!order) fail('Order not found', 404);
  res.json(await serializeOrder(order));
});
router.patch('/:id/status', async (req, res) => {
  res.json(await updateOrderStatus(res.locals.user, String(req.params.id), req.body?.status));
});

export default router;
