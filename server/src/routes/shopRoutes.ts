import { Router } from 'express';
import { listShops } from '../controllers/shopController.js';

const router = Router();

router.get('/', listShops);

export default router;
