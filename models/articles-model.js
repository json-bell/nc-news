const db = require("../db/connection");
const format = require("pg-format");
const { checkExists, getOrder, getPageString, getFilters } = require("./utils");

exports.selectArticles = ({ sort_by, order, topic, author, limit, p }) => {
  const potentialFilters = [
    {
      value: topic,
      column: "slug",
      table: "topics",
      filteredColumn: "topic",
    },
    {
      value: author,
      column: "username",
      table: "users",
      filteredColumn: "author",
    },
  ];
  return Promise.all([
    getOrder(order),
    getPageString(limit, p),
    getFilters(potentialFilters),
  ])
    .then(([queryOrder, pageString, [filterStr]]) => {
      const queryStr = format(
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
        ${filterStr}
        GROUP BY
            articles.article_id
        ORDER BY
            ${sort_by === "comment_count" ? "%I" : "articles.%I"} ${queryOrder}
        ${pageString};`,
        sort_by
      );
      const articlesQuery = db.query(queryStr);
      const countQuery = db.query(
        `SELECT COUNT(*)
        FROM articles
        ${filterStr}`
      );
      return Promise.all([articlesQuery, countQuery]);
    })
    .then(
      ([
        { rows: articles },
        {
          rows: [{ count }],
        },
      ]) => [articles, Number(count)]
    );
};

exports.insertArticle = (author, title, body, topic, article_img_url) => {
  const queryParams = [author, title, body, topic];
  if (article_img_url) queryParams.push(article_img_url);
  const colNames =
    "author, title, body, topic" + (article_img_url ? ", article_img_url" : "");
  const values = "$1, $2, $3, $4" + (article_img_url ? ",$5" : "");
  const queryStr = `INSERT INTO articles(${colNames})
      VALUES (${values})
      RETURNING
        *,
        0 as comment_count;
      `;
  return db.query(queryStr, queryParams).then(({ rows }) => rows[0]);
};

exports.selectArticleById = (article_id) => {
  return checkExists("articles", "article_id", article_id)
    .then(() =>
      db.query(
        `SELECT
        articles.*,
        COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY
        articles.article_id`,
        [article_id]
      )
    )
    .then(({ rows }) => rows[0]);
};

exports.updateArticle = (article_id, updates) => {
  return checkExists("articles", "article_id", article_id)
    .then(() => {
      const queryUpdateStrings = [];
      const queryParams = [article_id];
      const queryValidityCheckProms = [];
      const { inc_votes } = updates;
      if (inc_votes !== undefined) {
        queryUpdateStrings.push(` votes = votes + $${queryParams.length + 1}`);
        queryParams.push(inc_votes);
      }
      const validKeys = ["body", "title", "topic"];
      for (key of validKeys) {
        if (updates[key] !== undefined) {
          if (key === "topic") {
            queryValidityCheckProms.push(
              checkExists("topics", "slug", updates.topic)
            );
          }
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
      return Promise.all([queryStr, queryParams, ...queryValidityCheckProms]);
    })
    .then(([queryStr, queryParams]) => db.query(queryStr, queryParams))
    .then(({ rows }) => rows[0]);
};

exports.removeArticle = (article_id) => {
  return checkExists("articles", "article_id", article_id).then(() =>
    db.query("DELETE FROM articles WHERE article_id = $1", [article_id])
  );
};
