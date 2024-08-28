const {
  getUsers,
  getUserByUsername,
} = require("../controllers/users-controller");

const usersRouter = require("express").Router();
module.exports = usersRouter;

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getUserByUsername);
