const db = require("../db/connection");
const { checkExists } = require("./utils");

exports.selectArticles = (sort_by, order) => {
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
      ORDER BY articles.${sort_by} ${order.toUpperCase()};`
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

exports.updateArticle = (article_id, updates) => {
  return checkExists("articles", "article_id", article_id)
    .then(() => {
      const queryUpdateStrings = [];
      const queryParams = [article_id];
      const { inc_votes } = updates;
      if (inc_votes !== undefined) {
        // Is there a better way to do the parametrised query? User created references feel odd
        queryUpdateStrings.push(` votes = votes + $${queryParams.length + 1}`);
        queryParams.push(inc_votes);
      }
      const validKeys = ["body", "title", "topic"];
      for (key of validKeys) {
        if (updates[key] !== undefined) {
          /* for topics, I see a couple of ways of checking the topic is alright for the references:
          Either pass it to SQL and let that throw the error (what I'm currently doing)
          Or try to do 
          checkExists("topics","slug",updates.topic)
          but then we get nested promises, so we'd have to create some "PromiseChecks" promise
          to then return in a Promise.all,
          but this would still lead to same outcome (400 for invalid reference)
          */
          queryUpdateStrings.push(` ${key} = $${queryParams.length + 1}`);
          queryParams.push(updates[key]);
        }
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
