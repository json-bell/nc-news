const express = require("express");
const { defaultCatch } = require("./controllers/error-handling-middleware");
const { getTopics } = require("./controllers/topics-controller");

const app = express();
module.exports = app;

app.get("/api/topics", getTopics);

// Is a separate error handling middleware file like this alright?
// It felt crowded in previous sprints - would this count as a controller?
// Is there a way of naming/making more obvious that it's an error-handling middleware? Normally there's the 4 arguments but here it's not visible

app.use(defaultCatch);
