import { Router } from 'express';
import { listProducts } from '../controllers/productController.js';

const router = Router();

router.get('/shop', listProducts);
router.get('/', listProducts);

export default router;
