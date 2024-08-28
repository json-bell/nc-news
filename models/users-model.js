const db = require("../db/connection");
const { checkExists } = require("./utils");

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

exports.selectUserByUsername = (username) => {
  // checkExists makes for much cleaner code,
  // but it also selects exactly the same thing twice?
  // is it still good to do this or would a if rows.length === 0 be more appropriate
  return checkExists("users", "username", username)
    .then(() =>
      db.query(
        `SELECT * FROM users
        WHERE username = $1`,
        [username]
      )
    )
    .then(({ rows }) => rows[0]);
};
