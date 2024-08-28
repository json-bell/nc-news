const { getUsers } = require("../controllers/users-controller");

const usersRouter = require("express").Router();
module.exports = usersRouter;

usersRouter.get("/", getUsers);
