import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getCurrentUser,
  login,
  registerCustomer,
  registerShopOwner,
} from '../controllers/authController.js';

const router = Router();

router.get('/me', authMiddleware, getCurrentUser);
router.post('/login', login);
router.post('/register/customer', registerCustomer);
router.post('/register/shop', registerShopOwner);

export default router;
