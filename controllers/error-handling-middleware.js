exports.throwEndpointNotFound = (req, res, next) => {
  res.status(404).send({ msg: "Endpoint not found", code: 404 });
};

exports.handleCustomError = (err, req, res, next) => {
  if (err.code && err.msg)
    res.status(err.code).send({ msg: err.msg, code: err.code });
  else next(err);
};

exports.handleSqlError = (err, req, res, next) => {
  if (err.code === "22P02")
    res.status(400).send({ msg: "Bad request", code: 400 });
  else next(err);
};

exports.handleErrorDefault = (err, req, res, next) => {
  console.log("Default error:", err);
  res.status(500).send({ msg: "Default error", code: 500 });
};
