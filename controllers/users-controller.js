const {
  selectUsers,
  selectUserByUsername,
  insertUser,
} = require("../models/users-model");

exports.getUsers = (req, res, next) => {
  selectUsers().then((users) => res.status(200).send({ users }));
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  selectUserByUsername(username)
    .then((user) => res.status(200).send({ user }))
    .catch((err) => next(err));
};

exports.postUser = (req, res, next) => {
  const { username, name, avatar_url } = req.body;
  insertUser(username, name, avatar_url)
    .then((user) => res.status(201).send({ user }))
    .catch((err) => next(err));
};
