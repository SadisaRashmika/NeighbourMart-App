import { Router } from 'express';
import { listOrders } from '../controllers/orderController.js';
import { createShopOrder, deleteShopOrder, listShopOrders, updateShopOrderStatus } from '../controllers/shopOrderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/mine', authMiddleware, requireRole('customer'), listOrders);
router.get('/shop', authMiddleware, requireRole('shop'), listShopOrders);
router.post('/shop', authMiddleware, requireRole('shop'), createShopOrder);
router.get('/', authMiddleware, requireRole('customer'), listOrders);
router.patch('/:id/status', authMiddleware, requireRole('shop'), updateShopOrderStatus);
router.delete('/:id', authMiddleware, requireRole('shop'), deleteShopOrder);

export default router;
