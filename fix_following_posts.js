const fs = require('fs');
let code = fs.readFileSync('backend/src/services/post.service.ts', 'utf8');

const followingPostsFn = `export const getFollowingPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);

  const following = await prisma.follow.findMany({
    where: { followerId: userId }
  });
  const followingIds = following.map(f => f.followingId);

  const where: Prisma.PostWhereInput = { 
    userId: { in: followingIds } 
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
    isFollowing: true,
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
};\n`;

code = code.replace("export const toggleLike", followingPostsFn + "export const toggleLike");

fs.writeFileSync('backend/src/services/post.service.ts', code);
