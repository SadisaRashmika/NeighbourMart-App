import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.status(501).json({ message: 'User endpoints are not implemented yet' });
});

export default router;
