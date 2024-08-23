exports.throwEndpointNotFound = (req, res, next) => {
  res.status(404).send({ msg: "Endpoint not found" });
};

exports.handleErrorDefault = (err, req, res, next) => {
  console.log("Default error:", err);
  res.status(500).send({ msg: "Default error" });
};
