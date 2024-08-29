const {
  deleteComment,
  patchComment,
  getCommentById,
} = require("../controllers/comments-controller");

const commentsRouter = require("express").Router();
module.exports = commentsRouter;

commentsRouter.get("/:comment_id", getCommentById);

commentsRouter.delete("/:comment_id", deleteComment);

commentsRouter.patch("/:comment_id", patchComment);
