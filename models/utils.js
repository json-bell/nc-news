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
        details: `${column} '${value}' was not found in ${table}`,
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
  const errorObj = { msg: "Bad request", code: 400 };
  if (!Number.isInteger(limit))
    return Promise.reject({
      ...errorObj,
      details: "Invalid limit: must be a whole number",
    });
  if (!Number.isInteger(page))
    return Promise.reject({
      ...errorObj,
      details: "Invalid page: must be an integer",
    });
  if (limit < 0) {
    return Promise.reject({
      ...errorObj,
      details: "Limit must be non-negative",
    });
  }
  if (page <= 0) return `LIMIT 0`;
  return `LIMIT ${limit} OFFSET ${limit * (page - 1)}`;
};

exports.getFilters = (potentialFilters) => {
  const filters = potentialFilters.filter(({ value }) => value !== undefined);
  if (filters.length === 0) return [""];

  const filterValidityPromises = filters.map(({ table, column, value }) =>
    this.checkExists(table, column, value)
  );

  const filterStr =
    " WHERE " +
    filters
      .map(
        ({ filteredColumn, value }) => `articles.${filteredColumn} = '${value}'`
      )
      .join(" AND ");
  console.log(filterStr);
  return Promise.all([filterStr, Promise.all(filterValidityPromises)]);
};
