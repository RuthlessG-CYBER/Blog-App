import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response) => {
  return errorResponse(res, 404, 'API endpoint not found');
};
