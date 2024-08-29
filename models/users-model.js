const db = require("../db/connection");
const { checkExists } = require("./utils");

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

exports.selectUserByUsername = (username) => {
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
