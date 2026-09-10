import { Router } from 'express';
import { register, login, getMe, updateProfileController, googleLogin, checkUserTypeController, changePasswordController, verifyOldPasswordController, getUserProfileController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, upload.single('profileImage'), validate(updateProfileSchema), updateProfileController);

router.post('/google', googleLogin);

router.post('/check-user-type', checkUserTypeController);
router.post('/verify-old-password', verifyOldPasswordController);
router.post('/change-password', changePasswordController);

router.get('/user/:id', authMiddleware, getUserProfileController);

export default router;
