import { Request, Response, NextFunction } from 'express';
import { createPost, getPosts, getDiscoverPosts, getPostById, updatePost, deletePost, deletePostImage, toggleLike as toggleLikeService } from '../services/post.service';
import { uploadImage } from '../services/cloudinary.service';
import { successResponse } from '../utils/response';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const post = await createPost(userId, req.body);
    return successResponse(res, 201, 'Post created successfully', post);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await getPosts(userId, req.query);
    return successResponse(res, 200, 'Posts retrieved successfully', data.posts, data.pagination);
  } catch (error) {
    next(error);
  }
};

export const getDiscover = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await getDiscoverPosts(userId, req.query);
    return successResponse(res, 200, 'Discover posts retrieved successfully', data.posts, data.pagination);
  } catch (error) {
    next(error);
  }
};

export const getSingle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    const post = await getPostById(userId, postId);
    return successResponse(res, 200, 'Post retrieved successfully', post);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    const post = await updatePost(userId, postId, req.body);
    return successResponse(res, 200, 'Post updated successfully', post);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    await deletePost(userId, postId);
    return successResponse(res, 200, 'Post deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const removeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    const post = await deletePostImage(userId, postId);
    return successResponse(res, 200, 'Post image deleted successfully', post);
  } catch (error) {
    next(error);
  }
};

export const uploadPostImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const folder = `blog/users/${userId}/posts`;
    const imageData = await uploadImage(file.path, folder);

    const post = await updatePost(userId, postId, imageData);

    return successResponse(res, 200, 'Image uploaded successfully', post);
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id as string;
    const result = await toggleLikeService(userId, postId);
    return successResponse(res, 200, result.isLiked ? 'Post liked' : 'Post unliked', result);
  } catch (error) {
    next(error);
  }
};
