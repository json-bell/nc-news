const {
  selectArticleById,
  selectArticles,
  updateArticle,
  insertArticle,
  removeArticle,
} = require("../models/articles-model");

exports.getArticles = (req, res, next) => {
  const {
    sort_by = "created_at",
    order = "desc",
    topic,
    author,
    limit = 10,
    p = 1,
  } = req.query;
  selectArticles({ sort_by, order, topic, author, limit, p })
    .then(([articles, total_count]) => {
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => next(err));
};

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => next(err));
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(Number(article_id))
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  updateArticle(article_id, req.body)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => next(err));
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  return removeArticle(article_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};
