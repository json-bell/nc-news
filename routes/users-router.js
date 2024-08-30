const {
  getUsers,
  getUserByUsername,
  postUser,
} = require("../controllers/users-controller");

const usersRouter = require("express").Router();
module.exports = usersRouter;

usersRouter.get("/", getUsers).post("/", postUser);

usersRouter.get("/:username", getUserByUsername);
