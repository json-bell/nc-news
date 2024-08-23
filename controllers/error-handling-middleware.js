exports.throwEndpointNotFound = (req, res, next) => {
  if (true) res.status(404).send({ msg: "Endpoint not found" });
  else next(err);
};

exports.handleErrorDefault = (err, req, res, next) => {
  console.log("Default error:", err);
  res.status(500).send({ msg: "Default error" });
};
