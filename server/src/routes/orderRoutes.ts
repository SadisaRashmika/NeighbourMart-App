import { Router } from 'express';
import { listOrders } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { OrderModel } from '../models/Order.js';

const router = Router();

router.get('/mine', authMiddleware, async (_req, res) => {
  const orders = await OrderModel.find({ customer: res.locals.user.id }).sort({ createdAt: -1 });
  res.json(orders.map(o => ({ id: o.id, status: o.status, total: o.total })));
});
router.get('/shop', listOrders);
router.get('/', listOrders);

export default router;
