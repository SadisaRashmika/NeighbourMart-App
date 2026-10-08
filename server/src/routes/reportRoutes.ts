import { Router } from 'express';
import { createShopExport, deleteShopExport, getShopReport, listShopExports } from '../controllers/reportController.js';

const router = Router();

router.get('/shop', getShopReport);
router.get('/shop/exports', listShopExports);
router.post('/shop/exports', createShopExport);
router.delete('/shop/exports/:id', deleteShopExport);

export default router;
