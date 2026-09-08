const fs = require('fs');
let code = fs.readFileSync('backend/src/services/post.service.ts', 'utf8');

const regex = /const formattedPosts = posts\.map\(post => \(\{\n\s*\.\.\.post,\n\s*likesCount: post\._count\.likes,\s*commentsCount: post\._count\.comments,\n\s*isLiked: post\.likes\.length > 0,\n\s*likes: undefined,\n\s*_count: undefined,\n\s*\}\)\);/g;

code = code.replace("const formattedPosts = posts.map(post => ({", `
  const following = await prisma.follow.findMany({
    where: { followerId: userId, followingId: { in: posts.map(p => p.userId) } }
  });
  const followingIds = new Set(following.map(f => f.followingId));

  const formattedPosts = posts.map(post => ({
    isFollowing: followingIds.has(post.userId),
`);

fs.writeFileSync('backend/src/services/post.service.ts', code);
