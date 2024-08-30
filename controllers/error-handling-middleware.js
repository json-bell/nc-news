exports.throwEndpointNotFound = (req, res, next) => {
  res.status(404).send({ msg: "Endpoint not found", code: 404 });
};

exports.handleCustomError = (err, req, res, next) => {
  if (err.code && err.msg && err.details)
    res.status(err.code).send({
      msg: err.msg,
      code: err.code,
      details: err.details,
    });
  else if (err.code && err.msg)
    res.status(err.code).send({
      msg: err.msg,
      code: err.code,
    });
  else next(err);
};

exports.handleSqlError = (err, req, res, next) => {
  if (err.code === "22P02")
    // invalid type
    res.status(400).send({
      msg: "Bad request",
      code: 400,
      details: "Invalid input",
    });
  else if (err.code === "23505")
    // key already exists
    res.status(400).send({
      msg: "Bad request",
      code: 400,
      details: "Duplicate key",
    });
  else if (err.code === "23502")
    // not null violation
    res.status(400).send({
      msg: "Bad request",
      code: 400,
      details: "Missing input",
    });
  else if (err.code === "42703")
    // column doesn't exist
    res.status(400).send({
      msg: "Bad request",
      code: 400,
      details: "Invalid query",
    });
  else if (err.code === "23503")
    // foreign key violation
    res.status(404).send({
      msg: "Resource not found",
      code: 404,
      details: "Missing dependency",
    });
  else next(err);
};

exports.handleErrorDefault = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Default error:", err);
  }
  res.status(500).send({ msg: "Default error", code: 500 });
};
