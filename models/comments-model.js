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
