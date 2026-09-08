import { Router } from 'express';
import { toggleFollow, getProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/:id/follow', toggleFollow);
router.get('/:id', getProfile);

export default router;
