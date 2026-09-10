import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById, updateProfile, googleAuth, checkUserType, changePassword, verifyOldPassword } from '../services/auth.service';
import { uploadImage } from '../services/cloudinary.service';
import { successResponse } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await registerUser(req.body);
    return successResponse(res, 201, 'Registration successful', data);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await loginUser(req.body);
    return successResponse(res, 200, 'Login successful', data);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const data = await getUserById(req.user.userId);
    return successResponse(res, 200, 'User retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id as string;
    const data = await getUserById(userId);
    return successResponse(res, 200, 'User profile retrieved', data);
  } catch (error) {
    next(error);
  }
};

import prisma from '../config/database';

export const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    let profileData = { ...req.body };

    if (req.file) {
      // 24-hour limit check
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.profileImageUpdatedAt) {
        const hoursSinceLastUpdate = (Date.now() - user.profileImageUpdatedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastUpdate < 24) {
          return res.status(429).json({ success: false, message: 'You can only change your profile image once every 24 hours.' });
        }
      }

      const folder = `blog/users/${userId}/profile`;
      const imageData = await uploadImage(req.file.path, folder);
      profileData.profileImage = imageData.imageUrl;
      profileData.profileImageUpdatedAt = new Date();
    }

    const updatedUser = await updateProfile(userId, profileData);
    return successResponse(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }
    const data = await googleAuth(token);
    return successResponse(res, 200, 'Google login successful', data);
  } catch (error) {
    next(error);
  }
};

export const checkUserTypeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const data = await checkUserType(email);
    return successResponse(res, 200, 'User type checked', data);
  } catch (error) {
    next(error);
  }
};

export const verifyOldPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, oldPassword } = req.body;
    if (!email || !oldPassword) {
      return res.status(400).json({ success: false, message: 'Email and old password are required' });
    }
    const data = await verifyOldPassword({ email, oldPassword });
    return successResponse(res, 200, data.message, data);
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, old password, and new password are required' });
    }
    const data = await changePassword({ email, oldPassword, newPassword });
    return successResponse(res, 200, data.message, data);
  } catch (error) {
    next(error);
  }
};
