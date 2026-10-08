import { Router } from 'express';
import { createShopExport, deleteShopExport, getShopReport, listShopExports } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/shop', authMiddleware, requireRole('shop'), getShopReport);
router.get('/shop/exports', authMiddleware, requireRole('shop'), listShopExports);
router.post('/shop/exports', authMiddleware, requireRole('shop'), createShopExport);
router.delete('/shop/exports/:id', authMiddleware, requireRole('shop'), deleteShopExport);

export default router;