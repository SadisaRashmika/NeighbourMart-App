import { Router } from 'express';
import { cancelOrder, getOrder, listOrders, respondToOrderSubstitution } from '../controllers/orderController.js';
import { completeShopHandoff, confirmShopPayment, createShopOrder, createSubstitutionProposal, deleteShopOrder, getShopOrder, listShopOrders, updateShopOrderStatus, verifyShopPickup } from '../controllers/shopOrderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/mine', authMiddleware, requireRole('customer'), listOrders);
router.get('/shop', authMiddleware, requireRole('shop'), listShopOrders);
router.post('/shop', authMiddleware, requireRole('shop'), createShopOrder);
router.get('/shop/:id', authMiddleware, requireRole('shop'), getShopOrder);
router.get('/', authMiddleware, requireRole('customer'), listOrders);
router.get('/:id', authMiddleware, requireRole('customer'), getOrder);
router.patch('/:id/cancel', authMiddleware, requireRole('customer'), cancelOrder);
router.patch('/:id/items/:productId/substitution', authMiddleware, requireRole('customer'), respondToOrderSubstitution);
router.post('/:id/items/:productId/substitution', authMiddleware, requireRole('shop'), createSubstitutionProposal);
router.post('/:id/verify-pickup', authMiddleware, requireRole('shop'), verifyShopPickup);
router.patch('/:id/payment', authMiddleware, requireRole('shop'), confirmShopPayment);
router.post('/:id/complete-handoff', authMiddleware, requireRole('shop'), completeShopHandoff);
router.patch('/:id/status', authMiddleware, requireRole('shop'), updateShopOrderStatus);
router.delete('/:id', authMiddleware, requireRole('shop'), deleteShopOrder);

export default router;
