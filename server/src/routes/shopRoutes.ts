import { Router } from 'express';
import { getMyShop, listShops, updateMyShop } from '../controllers/shopController.js';

const router = Router();

router.get('/', listShops);
router.get('/me', getMyShop);
router.patch('/me', updateMyShop);

export default router;
