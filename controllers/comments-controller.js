const {
  selectCommentsByArticle,
  insertComment,
  removeComment,
  updateComment,
  selectCommentById,
} = require("../models/comments-model");

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  const {
    sort_by = "created_at",
    order = "desc",
    limit = 10,
    p = 1,
  } = req.query;
  selectCommentsByArticle(Number(article_id), { sort_by, order, limit, p })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  insertComment(article_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
};

exports.getCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  selectCommentById(comment_id)
    .then((comment) => res.status(200).send({ comment }))
    .catch((err) => next(err));
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => res.status(204).send({}))
    .catch((err) => next(err));
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  updateComment(comment_id, req.body)
    .then((comment) => res.status(200).send({ comment }))
    .catch((err) => next(err));
};
