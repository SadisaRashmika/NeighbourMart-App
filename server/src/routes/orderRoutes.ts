import { Router } from 'express';
import { listOrders } from '../controllers/orderController.js';
import { createShopOrder, deleteShopOrder, listShopOrders, updateShopOrderStatus } from '../controllers/shopOrderController.js';

const router = Router();

router.get('/mine', listOrders);
router.get('/shop', listShopOrders);
router.post('/shop', createShopOrder);
router.get('/', listOrders);
router.patch('/:id/status', updateShopOrderStatus);
router.delete('/:id', deleteShopOrder);

export default router;
