const fs = require('fs');

// 1. Controller
let controller = fs.readFileSync('backend/src/controllers/post.controller.ts', 'utf8');

const followingControllerFn = `export const getFollowingFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { getFollowingPosts } = require('../services/post.service');
    const data = await getFollowingPosts(userId, req.query);
    return successResponse(res, 200, 'Following posts retrieved successfully', data.posts, data.pagination);
  } catch (error) {
    next(error);
  }
};\n\n`;

controller = controller.replace("export const getSingle", followingControllerFn + "export const getSingle");
fs.writeFileSync('backend/src/controllers/post.controller.ts', controller);

// 2. Routes
let routes = fs.readFileSync('backend/src/routes/post.routes.ts', 'utf8');
routes = routes.replace(
  "router.get('/feed/discover', getDiscover);",
  "router.get('/feed/discover', getDiscover);\nrouter.get('/feed/following', require('../controllers/post.controller').getFollowingFeed);"
);
fs.writeFileSync('backend/src/routes/post.routes.ts', routes);

