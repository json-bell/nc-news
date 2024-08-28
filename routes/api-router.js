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

apiRouter.use("/users", usersRouter);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/comments", commentsRouter);
