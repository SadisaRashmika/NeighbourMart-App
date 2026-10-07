import { Router } from 'express';
import {
  getCurrentUser,
  login,
  registerCustomer,
  registerShopOwner,
  requestPasswordChangeCode,
  resetPassword,
  setPassword,
  verifyEmail,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authMiddleware, getCurrentUser);
router.post('/login', login);
router.post('/register/customer', registerCustomer);
router.post('/register/shop', registerShopOwner);
router.post('/verify-email', verifyEmail);
router.post('/set-password', setPassword);
router.post('/request-password-change', authMiddleware, requestPasswordChangeCode);
router.post('/reset-password', resetPassword);

export default router;
