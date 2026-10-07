import { Router } from 'express';
import {
  createShopProduct, deleteShopProduct, listProducts, listShopProducts, updateShopProduct,
} from '../controllers/productController.js';

const router = Router();

router.get('/shop', listShopProducts);
router.get('/', listProducts);
router.post('/', createShopProduct);
router.put('/:id', updateShopProduct);
router.delete('/:id', deleteShopProduct);

export default router;
