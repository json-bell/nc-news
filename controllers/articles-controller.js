const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticle,
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

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsByArticle(Number(article_id))
    .then((comments) => {
      console.log(comments);
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};
