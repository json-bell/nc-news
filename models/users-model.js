const db = require("../db/connection");
const { checkExists } = require("./utils");

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

exports.selectUserByUsername = (username) => {
  return checkExists("users", "username", username).then(({ rows }) => rows[0]);
};

exports.insertUser = (username, name, avatar_url) => {
  return db
    .query(
      `INSERT INTO users(username, name, avatar_url)
    VALUES
      ($1,$2,$3)
    RETURNING *`,
      [username, name, avatar_url]
    )
    .then(({ rows }) => rows[0]);
};
