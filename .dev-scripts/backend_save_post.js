const fs = require('fs');

// 1. post.service.ts
let service = fs.readFileSync('backend/src/services/post.service.ts', 'utf8');

const toggleSaveFn = `export const toggleSave = async (userId: string, postId: string) => {
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
            user: { select: { id: true, name: true, profileImage: true } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId } },
            savedBy: { where: { userId } }
          }
        }
      }
    }),
    prisma.savedPost.count({ where: { userId } }),
  ]);

  const formattedPosts = savedPosts.map(sp => ({
    ...sp.post,
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
};\n\n`;

service = service.replace("export const addComment", toggleSaveFn + "export const addComment");

// Update other post fetching logic to include `isSaved` and `savedBy`
service = service.replace(/likes: \{ where: \{ userId \} \}/g, "likes: { where: { userId } },\n      savedBy: { where: { userId } }");
service = service.replace(/isLiked: post\.likes\.length > 0,/g, "isLiked: post.likes.length > 0,\n      isSaved: post.savedBy?.length > 0,");

fs.writeFileSync('backend/src/services/post.service.ts', service);


// 2. post.controller.ts
let controller = fs.readFileSync('backend/src/controllers/post.controller.ts', 'utf8');

const controllerFns = `export const toggleSaveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id;
    const { toggleSave } = require('../services/post.service');
    const result = await toggleSave(userId, postId);
    return successResponse(res, 200, result.isSaved ? 'Post saved' : 'Post unsaved', result);
  } catch (error) {
    next(error);
  }
};

export const getSavedFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { getSavedPosts } = require('../services/post.service');
    const data = await getSavedPosts(userId, req.query);
    return successResponse(res, 200, 'Saved posts retrieved', data.posts, data.pagination);
  } catch (error) {
    next(error);
  }
};\n\n`;

controller = controller.replace("export const createComment", controllerFns + "export const createComment");
fs.writeFileSync('backend/src/controllers/post.controller.ts', controller);


// 3. post.routes.ts
let routes = fs.readFileSync('backend/src/routes/post.routes.ts', 'utf8');
routes = routes.replace(
  "router.get(\"/feed/following\", require(\"../controllers/post.controller\").getFollowingFeed);",
  "router.get(\"/feed/following\", require(\"../controllers/post.controller\").getFollowingFeed);\nrouter.get(\"/saved\", require(\"../controllers/post.controller\").getSavedFeed);"
);
routes = routes.replace(
  "router.post(\"/:id/like\", toggleLike);",
  "router.post(\"/:id/like\", toggleLike);\nrouter.post(\"/:id/save\", require(\"../controllers/post.controller\").toggleSaveController);"
);
fs.writeFileSync('backend/src/routes/post.routes.ts', routes);

