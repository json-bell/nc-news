const {
  getArticles,
  getArticleById,
  patchArticle,
  postArticle,
  deleteArticle,
} = require("../controllers/articles-controller");
const {
  getCommentsByArticle,
  postComment,
} = require("../controllers/comments-controller");

const articlesRouter = require("express").Router();
module.exports = articlesRouter;

articlesRouter /* */
  .get("/", getArticles)
  .post("/", postArticle);

articlesRouter
  .get("/:article_id", getArticleById)
  .patch("/:article_id", patchArticle)
  .delete("/:article_id", deleteArticle);

articlesRouter
  .get("/:article_id/comments", getCommentsByArticle)
  .post("/:article_id/comments", postComment);
