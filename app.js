const express = require("express");
const {
  handleErrorDefault,
  throwEndpointNotFound,
  handleSqlError,
  handleCustomError,
} = require("./controllers/error-handling-middleware");
const { getTopics } = require("./controllers/topics-controller");
const { getApiInfo } = require("./controllers/api-controller");
const {
  getArticleById,
  getArticle,
  patchArticle,
} = require("./controllers/articles-controller");
const {
  getCommentsByArticle,
  postComment,
  deleteComment,
} = require("./controllers/comments-controller");

//

const app = express();
module.exports = app;

app.use(express.json());

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticle);

app
  .get("/api/articles/:article_id", getArticleById)
  .patch("/api/articles/:article_id", patchArticle);

app
  .get("/api/articles/:article_id/comments", getCommentsByArticle)
  .post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.use(throwEndpointNotFound);

app.use(handleSqlError);

app.use(handleCustomError);

app.use(handleErrorDefault);
