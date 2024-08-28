const format = require("pg-format");
const db = require("../db/connection");

exports.checkExists = (table, column, value) => {
  const queryStr = format(
    `SELECT * FROM %I
    WHERE %I = $1`,
    table,
    column
  );
  return db.query(queryStr, [value]).then(({ rows }) => {
    if (rows.length === 0)
      return Promise.reject({ code: 404, msg: "Resource not found" });
  });
};

exports.getOrder = (order) => {
  if (order.toLowerCase() === "asc") return Promise.resolve("ASC");
  if (order.toLowerCase() === "desc") return Promise.resolve("DESC");
  return Promise.reject({ msg: "Bad request", code: 400 });
};
