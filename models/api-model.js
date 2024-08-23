const fs = require("fs/promises");

exports.selectApiInfo = () => {
  return Promise.resolve(require("../endpoints.json"));
};
