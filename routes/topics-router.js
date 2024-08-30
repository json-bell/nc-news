const { getTopics, postTopic } = require("../controllers/topics-controller");

const topicsRouter = require("express").Router();
module.exports = topicsRouter;

topicsRouter.get("/", getTopics);

topicsRouter.post("/", postTopic);
