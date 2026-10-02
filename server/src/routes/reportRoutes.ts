import { Router } from 'express';
import { getShopReport } from '../controllers/reportController.js';

const router = Router();

router.get('/shop', getShopReport);

export default router;
