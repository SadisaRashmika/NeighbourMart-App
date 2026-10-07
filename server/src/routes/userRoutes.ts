import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { listUsers, updateCurrentUser } from '../controllers/userController.js';

const router = Router();

router.get('/', listUsers);
router.put('/me', authMiddleware, updateCurrentUser);

export default router;
