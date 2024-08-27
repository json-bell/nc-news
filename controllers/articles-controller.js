const {
  selectArticleById,
  selectArticles,
} = require("../models/articles-model");

exports.getArticle = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
};

exports.getArticleById = (req, res, next) => {
  selectArticleById(Number(req.params.article_id))
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};
