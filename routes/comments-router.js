const {
  deleteComment,
  patchComment,
} = require("../controllers/comments-controller");

const commentsRouter = require("express").Router();
module.exports = commentsRouter;

commentsRouter.delete("/:comment_id", deleteComment);

commentsRouter.patch("/:comment_id", patchComment);
