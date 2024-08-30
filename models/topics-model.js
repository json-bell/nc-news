const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => rows);
};

exports.insertTopic = (slug, description = slug) => {
  return db
    .query(
      `INSERT INTO topics(slug,description)
      VALUES ($1,$2)
      RETURNING *`,
      [slug, description]
    )
    .then(({ rows }) => rows[0]);
};
