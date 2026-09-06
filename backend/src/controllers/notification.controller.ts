import { Request, Response, NextFunction } from 'express';
import { getNotifications, markAsRead } from '../services/notification.service';
import { successResponse } from '../utils/response';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await getNotifications(userId, req.query);
    return successResponse(res, 200, 'Notifications retrieved successfully', data.notifications, data.pagination);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await markAsRead(userId);
    return successResponse(res, 200, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};
