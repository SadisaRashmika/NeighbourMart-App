import { Router } from 'express';
import { listOrders } from '../controllers/orderController.js';

const router = Router();

router.get('/mine', listOrders);
router.get('/shop', listOrders);
router.get('/', listOrders);

export default router;
