import { Router } from 'express';
import { getCurrentUser } from '../controllers/authController.js';

const router = Router();

router.get('/me', getCurrentUser);

export default router;
