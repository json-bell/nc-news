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
      return Promise.reject({
        code: 404,
        msg: "Resource not found",
        details: `${value} was not found in ${column}`,
      });
    return { rows };
  });
};

exports.getOrder = (order) => {
  if (order.toLowerCase() === "asc") return Promise.resolve("ASC");
  if (order.toLowerCase() === "desc") return Promise.resolve("DESC");
  return Promise.reject({
    msg: "Bad request",
    code: 400,
    details: "Invalid order query",
  });
};

exports.getPageString = (limitStr, pageStr) => {
  if (["0", "infinity", "none"].includes(limitStr)) return "";
  const limit = Number(limitStr);
  const page = Number(pageStr);
  if (!Number.isInteger(limit) || !Number.isInteger(page))
    return Promise.reject({
      msg: "Bad request",
      code: 400,
      details: "Invalid pagination",
    });
  if (limit < 0) {
    return Promise.reject({
      msg: "Bad request",
      code: 400,
      details: "Limit must be non-negative",
    });
  }
  if (page <= 0) return `LIMIT 0`;
  return `LIMIT ${limit} OFFSET ${limit * (page - 1)}`;
};
