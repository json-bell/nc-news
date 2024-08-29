// endpoint is /api/articles... but feels separate? is there a convention of following original enpoint or is it just what feels right
const db = require("../db/connection");
const { checkExists } = require("./utils");

exports.selectCommentsByArticle = (article_id) => {
  return checkExists("articles", "article_id", article_id)
    .then(() =>
      db.query(
        `SELECT * FROM comments
        WHERE article_id=$1
        ORDER BY created_at DESC`,
        [article_id]
      )
    )
    .then(({ rows }) => rows);
};

exports.insertComment = (article_id, { username, body }) => {
  return db
    .query(
      `INSERT INTO comments (author,body,article_id,votes)
    VALUES
      ($1,$2,$3,$4)
    RETURNING *`,
      [username, body, article_id, 0]
    )
    .then(({ rows }) => rows[0]);
};

exports.selectCommentById = (comment_id) => {
  return checkExists("comments", "comment_id", comment_id)
    .then(() =>
      db.query(
        `SELECT * FROM comments
        WHERE comment_id = $1`,
        [comment_id]
      )
    )
    .then(({ rows }) => rows[0]);
};

exports.removeComment = (comment_id) => {
  return checkExists("comments", "comment_id", comment_id).then(() =>
    db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
  );
};

exports.updateComment = (comment_id, { inc_votes, body }) => {
  return checkExists("comments", "comment_id", comment_id)
    .then(() => {
      const queryUpdateStrings = [];
      const queryParams = [comment_id];
      if (inc_votes !== undefined) {
        queryParams.push(inc_votes);
        queryUpdateStrings.push(` votes = votes + $${queryParams.length}`);
      }
      if (body !== undefined) {
        queryParams.push(body);
        queryUpdateStrings.push(` body = $${queryParams.length}`);
      }
      const queryStr =
        queryUpdateStrings.length === 0
          ? `SELECT * FROM comments WHERE comment_id = $1`
          : `UPDATE comments SET ` +
            queryUpdateStrings.join(", ") +
            ` WHERE comment_id = $1 RETURNING *`;
      return db.query(queryStr, queryParams);
    })
    .then(({ rows }) => rows[0]);
};
