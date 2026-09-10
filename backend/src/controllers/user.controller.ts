import { Request, Response, NextFunction } from 'express';
import { toggleFollowUser, getUserProfile, getFollowers, getFollowing } from '../services/user.service';
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

export const getFollowersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id as string;
    const result = await getFollowers(userId);
    return successResponse(res, 200, 'Followers retrieved', result);
  } catch (error) {
    next(error);
  }
};

export const getFollowingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id as string;
    const result = await getFollowing(userId);
    return successResponse(res, 200, 'Following retrieved', result);
  } catch (error) {
    next(error);
  }
};
