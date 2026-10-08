import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteCurrentUser, listUsers, updateCurrentUser } from '../controllers/userController.js';

const router = Router();

router.get('/', listUsers);
router.put('/me', authMiddleware, updateCurrentUser);
router.delete('/me', authMiddleware, deleteCurrentUser);

export default router;
