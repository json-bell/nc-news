exports.defaultCatch = (err, req, res, next) => {
  console.log("Default error:", err);
  res.status(500).send({ msg: "Default error" });
};
