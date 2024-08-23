const express = require("express");

const app = express();
module.exports = app;

app.use((err, req, res, next) => {
  console.log("Default error:", err);
  res.status(500).send({ msg: "Default error" });
});
