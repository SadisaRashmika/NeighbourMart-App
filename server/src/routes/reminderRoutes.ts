import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteCurrentReminder, getCurrentReminder, updateCurrentReminder } from '../controllers/reminderController.js';

const router = Router();

router.use(authMiddleware);
router.get('/me', getCurrentReminder);
router.put('/me', updateCurrentReminder);
router.delete('/me', deleteCurrentReminder);

export default router;