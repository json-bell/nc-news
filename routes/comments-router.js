const {
  deleteComment,
  patchComment,
  getCommentById,
} = require("../controllers/comments-controller");

const commentsRouter = require("express").Router();
module.exports = commentsRouter;

commentsRouter
  .get("/:comment_id", getCommentById)
  .delete("/:comment_id", deleteComment)
  .patch("/:comment_id", patchComment);
