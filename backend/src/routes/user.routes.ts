import { Router } from 'express';
import { toggleFollow, getProfile, getFollowersController, getFollowingController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/:id/follow', toggleFollow);
router.get('/:id', getProfile);
router.get('/:id/followers', getFollowersController);
router.get('/:id/following', getFollowingController);

export default router;
