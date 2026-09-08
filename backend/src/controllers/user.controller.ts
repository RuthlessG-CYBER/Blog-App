import { Request, Response, NextFunction } from 'express';
import { toggleFollowUser, getUserProfile } from '../services/user.service';
import { successResponse } from '../utils/response';

export const toggleFollow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user!.userId;
    const followingId = req.params.id as string;
    const result = await toggleFollowUser(followerId, followingId);
    return successResponse(res, 200, result.isFollowing ? 'User followed' : 'User unfollowed', result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user!.userId;
    const targetUserId = req.params.id as string;
    const result = await getUserProfile(currentUserId, targetUserId);
    return successResponse(res, 200, 'User profile retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
