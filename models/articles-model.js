const db = require("../db/connection");
const { checkExists } = require("./utils");

exports.selectArticles = () => {
  return db
    .query(
      `SELECT
          articles.author,
          articles.title,
          articles.article_id,
          articles.topic,
          articles.created_at,
          articles.votes,
          articles.article_img_url,
          COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments
          ON articles.article_id = comments.article_id
      GROUP BY
          articles.article_id
      ORDER BY articles.created_at DESC;`
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
      if (rows.length === 0)
        return Promise.reject({ msg: "Resource not found", code: 404 });
      return rows[0];
    });
};

exports.updateArticle = (article_id, inc_votes) => {
  return checkExists("articles", "article_id", article_id)
    .then(() => {
      const queryUpdateStrings = [];
      const queryParams = [article_id];
      if (inc_votes !== undefined) {
        queryUpdateStrings.push(` votes = votes + $2`);
        queryParams[1] = inc_votes;
      }
      const queryStr =
        queryUpdateStrings.length === 0
          ? `SELECT * FROM articles WHERE article_id = $1`
          : `UPDATE articles SET ` +
            queryUpdateStrings.join(",") +
            ` WHERE article_id = $1 RETURNING *;`;
      return db.query(queryStr, queryParams);
    })
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ msg: "Resource not found", code: 404 });
      return rows[0];
    });
};
