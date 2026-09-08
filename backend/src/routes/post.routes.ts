import { Router } from "express";
import {
  create,
  getAll,
  getDiscover,
  getSingle,
  update,
  remove,
  removeImage,
  uploadPostImage,
  toggleLike,
} from "../controllers/post.controller";
import { validate } from "../middleware/validation.middleware";
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/post.validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createPostSchema), create);
router.get("/feed/discover", getDiscover);
router.get("/feed/following", require("../controllers/post.controller").getFollowingFeed);
router.get("/saved", require("../controllers/post.controller").getSavedFeed);
router.get("/", getAll);
router.get("/:id", getSingle);
router.put("/:id", validate(updatePostSchema), update);
router.delete("/:id", remove);

router.post("/:id/image", upload.single("image"), uploadPostImage);
router.delete("/:id/image", removeImage);

router.post("/:id/like", toggleLike);
router.post("/:id/save", require("../controllers/post.controller").toggleSaveController);
router.post(
  "/:id/comments",
  require("../controllers/post.controller").createComment,
);
router.get(
  "/:id/comments",
  require("../controllers/post.controller").getPostComments,
);

export default router;
