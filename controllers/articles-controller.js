const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticle,
  updateArticle,
} = require("../models/articles-model");

exports.getArticle = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
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
  const { inc_votes } = req.body;
  updateArticle(article_id, inc_votes)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => next(err));
};
