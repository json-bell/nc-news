const db = require("../db/connection");

exports.selectArticles = () => {
  return db
    .query(
      `SELECT
          author,
          title,
          article_id,
          topic,
          created_at,
          votes,
          article_img_url
      FROM articles`
    )
    .then(({ rows }) => rows);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
    WHERE article_id = $1;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ msg: "Article not found", code: 404 });
      }
      return rows[0];
    });
};
