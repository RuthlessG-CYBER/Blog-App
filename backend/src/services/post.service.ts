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
        likes: { where: { userId } },
      savedBy: { where: { userId } }
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
      isSaved: post.savedBy?.length > 0,
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
  const { page = 1, limit = 10, depth = 0 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);
  
  let rawPostIds;
  if (Number(depth) === 0) {
    rawPostIds = await prisma.$queryRaw<any[]>`
      WITH RankedPosts AS (
        SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
        FROM "Post"
        WHERE "userId" != ${userId}
      )
      SELECT id FROM RankedPosts
      WHERE rn = 1
      ORDER BY "createdAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `;
  } else {
    rawPostIds = await prisma.$queryRaw<any[]>`
      WITH RankedPosts AS (
        SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY RANDOM()) as rn
        FROM "Post"
        WHERE "userId" != ${userId}
      )
      SELECT id FROM RankedPosts
      WHERE rn = 1
      ORDER BY "createdAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `;
  }

  const postIds = rawPostIds.map(p => p.id);

  const totalRaw = await prisma.$queryRaw<any[]>`
    WITH RankedPosts AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
      FROM "Post"
      WHERE "userId" != ${userId}
    )
    SELECT CAST(COUNT(*) AS INTEGER) as count FROM RankedPosts WHERE rn = 1
  `;
  const total = totalRaw[0]?.count || 0;

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, username: true, email: true, profileImage: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId } },
      savedBy: { where: { userId } }
    }
  });

  const following = await prisma.follow.findMany({
    where: { followerId: userId, followingId: { in: posts.map(p => p.userId) } }
  });
  const followingIds = new Set(following.map(f => f.followingId));

  const followers = await prisma.follow.findMany({
    where: { followingId: userId, followerId: { in: posts.map(p => p.userId) } }
  });
  const followerIds = new Set(followers.map(f => f.followerId));

  const formattedPosts = postIds.map(id => {
    const post = posts.find(p => p.id === id)!;
    return {
      isFollowing: followingIds.has(post.userId),
      isFollowedBy: followerIds.has(post.userId),
      ...post,
      likesCount: post._count.likes, commentsCount: post._count.comments,
      isLiked: post.likes.length > 0,
      isSaved: post.savedBy?.length > 0,
      likes: undefined,
      _count: undefined,
    };
  });

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
export const getFollowingPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);
  
  const following = await prisma.follow.findMany({
    where: { followerId: userId }
  });
  const followingIds = following.map(f => f.followingId);
  

  const total = await prisma.post.count({
    where: { userId: { in: followingIds } }
  });

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      user: { select: { id: true, name: true, username: true, email: true, profileImage: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId } },
      savedBy: { where: { userId } }
    }
  });

  const followers = await prisma.follow.findMany({
    where: { followingId: userId, followerId: { in: posts.map(p => p.userId) } }
  });
  const followerIds = new Set(followers.map(f => f.followerId));

  const formattedPosts = posts.map(post => {
    return {
      isFollowing: true,
      isFollowedBy: followerIds.has(post.userId),
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: post.likes.length > 0,
      isSaved: post.savedBy?.length > 0,
      likes: undefined,
      _count: undefined,
    };
  });

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

export const toggleSave = async (userId: string, postId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw { statusCode: 404, message: 'Post not found' };

  const saved = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId, postId } }
  });

  if (saved) {
    await prisma.savedPost.delete({ where: { id: saved.id } });
    return { isSaved: false };
  } else {
    await prisma.savedPost.create({ data: { userId, postId } });
    return { isSaved: true };
  }
};

export const getSavedPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);

  const [savedPosts, total] = await prisma.$transaction([
    prisma.savedPost.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            user: { select: { id: true, name: true, username: true, profileImage: true } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId } },
            savedBy: { where: { userId } }
          }
        }
      }
    }),
    prisma.savedPost.count({ where: { userId } }),
  ]);

  const followers = await prisma.follow.findMany({
    where: { followingId: userId, followerId: { in: savedPosts.map(sp => sp.post.userId) } }
  });
  const followerIds = new Set(followers.map(f => f.followerId));

  const formattedPosts = savedPosts.map(sp => ({
    ...sp.post,
    isFollowedBy: followerIds.has(sp.post.userId),
    likesCount: sp.post._count.likes,
    commentsCount: sp.post._count.comments,
    isLiked: sp.post.likes.length > 0,
    isSaved: true,
    likes: undefined,
    savedBy: undefined,
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
        select: { id: true, name: true, username: true, email: true, profileImage: true },
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
        select: { id: true, name: true, username: true, profileImage: true },
      },
    },
  });
  return comments;
};
