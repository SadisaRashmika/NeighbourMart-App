import { Router } from 'express';
import { getShopReport } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/shop', authMiddleware, requireRole('shop'), getShopReport);

export default router;
