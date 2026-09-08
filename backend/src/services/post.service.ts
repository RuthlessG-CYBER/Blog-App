import prisma from '../config/database';
import { deleteImage } from './cloudinary.service';
import { Prisma } from '@prisma/client';

export const createPost = async (userId: string, data: any) => {
  const { title, content, imageUrl, imagePublicId } = data;
  const post = await prisma.post.create({
    data: {
      userId,
      title,
      content,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
    },
  });
  return post;
};

export const getPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10, search, date, from, to, sort = 'newest' } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);

  const where: Prisma.PostWhereInput = { userId };

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { content: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (date) {
    const startOfDay = new Date(date as string);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setUTCHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  } else if (from && to) {
    where.createdAt = {
      gte: new Date(from as string),
      lte: new Date(to as string),
    };
  }

  const orderBy: Prisma.PostOrderByWithRelationInput = {
    createdAt: sort === 'oldest' ? 'asc' : 'desc',
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId } }
      }
    }),
    prisma.post.count({ where }),
  ]);

  
  const following = await prisma.follow.findMany({
    where: { followerId: userId, followingId: { in: posts.map(p => p.userId) } }
  });
  const followingIds = new Set(following.map(f => f.followingId));

  const formattedPosts = posts.map(post => ({
    isFollowing: followingIds.has(post.userId),

    ...post,
    likesCount: post._count.likes, commentsCount: post._count.comments,
    isLiked: post.likes.length > 0,
    likes: undefined,
    _count: undefined,
  }));

  return {
    posts: formattedPosts,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};
export const getDiscoverPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);

  const where: Prisma.PostWhereInput = { 
    userId: { not: userId } 
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, profileImage: true }
        },
        _count: { select: { likes: true, comments: true } },
        likes: {
          where: { userId }
        }
      }
    }),
    prisma.post.count({ where }),
  ]);

  const formattedPosts = posts.map(post => ({
    ...post,
    likesCount: post._count.likes, commentsCount: post._count.comments,
    isLiked: post.likes.length > 0,
    likes: undefined,
    _count: undefined,
  }));

  return {
    posts: formattedPosts,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};
export const toggleLike = async (userId: string, postId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw { statusCode: 404, message: 'Post not found' };

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    await prisma.notification.deleteMany({
      where: {
        userId: post.userId,
        actorId: userId,
        postId: postId,
        type: 'LIKE',
      },
    });

    return { isLiked: false };
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    if (userId !== post.userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          actorId: userId,
          postId: postId,
          type: 'LIKE',
        },
      });
    }

    return { isLiked: true };
  }
};
export const getPostById = async (userId: string, postId: string) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  return post;
};

export const updatePost = async (userId: string, postId: string, data: any) => {
  const existingPost = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!existingPost) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  const hoursSinceCreation = (new Date().getTime() - existingPost.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 3) {
    throw { statusCode: 403, message: 'Posts can only be edited within 3 hours of creation.' };
  }

  const { title, content, imageUrl, imagePublicId } = data;

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(imagePublicId !== undefined && { imagePublicId }),
    },
  });

  return post;
};

export const deletePost = async (userId: string, postId: string) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  if (post.imagePublicId) {
    await deleteImage(post.imagePublicId);
  }

  await prisma.post.delete({
    where: { id: postId },
  });
};

export const deletePostImage = async (userId: string, postId: string) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  if (post.imagePublicId) {
    await deleteImage(post.imagePublicId);
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      imageUrl: null,
      imagePublicId: null,
    },
  });

  return updatedPost;
};

export const addComment = async (userId: string, postId: string, content: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw { statusCode: 404, message: 'Post not found' };

  const comment = await prisma.comment.create({
    data: {
      userId,
      postId,
      content,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, profileImage: true },
      },
    },
  });

  if (userId !== post.userId) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        actorId: userId,
        postId: postId,
        type: 'COMMENT',
      },
    });
  }

  return comment;
};

export const getComments = async (postId: string) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, profileImage: true },
      },
    },
  });
  return comments;
};
