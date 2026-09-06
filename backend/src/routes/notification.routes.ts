import { Router } from 'express';
import { getAll, markAllAsRead } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.post('/read', markAllAsRead);

export default router;
