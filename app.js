const express = require("express");
const {
  handleErrorDefault,
  throwEndpointNotFound,
} = require("./controllers/error-handling-middleware");
const { getTopics } = require("./controllers/topics-controller");
const { getApiInfo } = require("./controllers/api-controller");

const app = express();
module.exports = app;

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.use(throwEndpointNotFound);

app.use(handleErrorDefault);
