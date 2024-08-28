const express = require("express");
const {
  handleErrorDefault,
  throwEndpointNotFound,
  handleSqlError,
  handleCustomError,
} = require("./controllers/error-handling-middleware");
const apiRouter = require("./routes/api-router");

//

const app = express();
module.exports = app;

app.use(express.json());

app.use("/api", apiRouter);

app.use(throwEndpointNotFound);

app.use(handleSqlError);

app.use(handleCustomError);

app.use(handleErrorDefault);
