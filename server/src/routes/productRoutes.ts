import { Router } from 'express';
import {
  createShopProduct, deleteShopProduct, listProducts, listShopProducts, updateShopProduct,
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/shop', authMiddleware, requireRole('shop'), listShopProducts);
router.get('/', listProducts);
router.post('/', authMiddleware, requireRole('shop'), createShopProduct);
router.put('/:id', authMiddleware, requireRole('shop'), updateShopProduct);
router.delete('/:id', authMiddleware, requireRole('shop'), deleteShopProduct);

export default router;
