import { Router } from 'express';
import { getMyShop, listShops, updateMyShop } from '../controllers/shopController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', listShops);
router.get('/me', authMiddleware, requireRole('shop'), getMyShop);
router.patch('/me', authMiddleware, requireRole('shop'), updateMyShop);

export default router;
