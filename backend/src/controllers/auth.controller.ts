import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById, updateProfile } from '../services/auth.service';
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
