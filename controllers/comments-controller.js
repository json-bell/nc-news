const { selectCommentsByArticle } = require("../models/comments-model");

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsByArticle(Number(article_id))
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};
