const fs = require('fs');
let code = fs.readFileSync('backend/src/services/post.service.ts', 'utf8');

const getDiscoverPostsStr = `export const getDiscoverPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10, depth = 0 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);
  const rn = Number(depth) + 1;

  const rawPostIds = await prisma.$queryRaw<any[]>\`
    WITH RankedPosts AS (
      SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
      FROM "Post"
      WHERE "userId" != \${userId}
    )
    SELECT id FROM RankedPosts
    WHERE rn = \${rn}
    ORDER BY "createdAt" DESC
    LIMIT \${take} OFFSET \${skip}
  \`;

  const postIds = rawPostIds.map(p => p.id);

  const totalRaw = await prisma.$queryRaw<any[]>\`
    WITH RankedPosts AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
      FROM "Post"
      WHERE "userId" != \${userId}
    )
    SELECT CAST(COUNT(*) AS INTEGER) as count FROM RankedPosts WHERE rn = \${rn}
  \`;
  const total = totalRaw[0]?.count || 0;

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId } }
    }
  });

  const following = await prisma.follow.findMany({
    where: { followerId: userId, followingId: { in: posts.map(p => p.userId) } }
  });
  const followingIds = new Set(following.map(f => f.followingId));

  const formattedPosts = postIds.map(id => {
    const post = posts.find(p => p.id === id)!;
    return {
      isFollowing: followingIds.has(post.userId),
      ...post,
      likesCount: post._count.likes, commentsCount: post._count.comments,
      isLiked: post.likes.length > 0,
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
};`;

const getFollowingPostsStr = `export const getFollowingPosts = async (userId: string, query: any) => {
  const { page = 1, limit = 10, depth = 0 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);
  const rn = Number(depth) + 1;

  const following = await prisma.follow.findMany({
    where: { followerId: userId }
  });
  const followingIds = following.map(f => f.followingId);

  if (followingIds.length === 0) {
    return { posts: [], pagination: { page: Number(page), limit: take, total: 0, totalPages: 0 } };
  }

  const rawPostIds = await prisma.$queryRaw<any[]>\`
    WITH RankedPosts AS (
      SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
      FROM "Post"
      WHERE "userId" = ANY(ARRAY[\${Prisma.join(followingIds)}]::uuid[])
    )
    SELECT id FROM RankedPosts
    WHERE rn = \${rn}
    ORDER BY "createdAt" DESC
    LIMIT \${take} OFFSET \${skip}
  \`;

  const postIds = rawPostIds.map(p => p.id);

  const totalRaw = await prisma.$queryRaw<any[]>\`
    WITH RankedPosts AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
      FROM "Post"
      WHERE "userId" = ANY(ARRAY[\${Prisma.join(followingIds)}]::uuid[])
    )
    SELECT CAST(COUNT(*) AS INTEGER) as count FROM RankedPosts WHERE rn = \${rn}
  \`;
  const total = totalRaw[0]?.count || 0;

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId } }
    }
  });

  const formattedPosts = postIds.map(id => {
    const post = posts.find(p => p.id === id)!;
    return {
      isFollowing: true,
      ...post,
      likesCount: post._count.likes, commentsCount: post._count.comments,
      isLiked: post.likes.length > 0,
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
};`;

// Replace getDiscoverPosts
code = code.replace(/export const getDiscoverPosts = async [\s\S]*?export const getFollowingPosts =/m, getDiscoverPostsStr + '\nexport const getFollowingPosts =');

// Replace getFollowingPosts
code = code.replace(/export const getFollowingPosts = async [\s\S]*?export const toggleLike =/m, getFollowingPostsStr + '\nexport const toggleLike =');

fs.writeFileSync('backend/src/services/post.service.ts', code);
