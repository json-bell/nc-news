const { selectApiInfo } = require("../models/api-model");

exports.getApiInfo = (req, res, next) => {
  selectApiInfo()
    .then((endpoints) => res.status(200).send(endpoints))
    .catch((err) => next(err));
};
