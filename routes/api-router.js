const {
  usersRouter,
  topicsRouter,
  articlesRouter,
  commentsRouter,
} = require(".");
const { getApiInfo } = require("../controllers/api-controller");

const apiRouter = require("express").Router();
module.exports = apiRouter;

apiRouter.all("/", getApiInfo);

apiRouter
  .use("/users", usersRouter)
  .use("/topics", topicsRouter)
  .use("/articles", articlesRouter)
  .use("/comments", commentsRouter);
