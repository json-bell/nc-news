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

exports.removeComment = (comment_id) => {
  return checkExists("comments", "comment_id", comment_id).then(() =>
    db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
  );
};
