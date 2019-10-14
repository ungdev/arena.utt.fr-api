const Express = require("express");
const Login = require("./login.js");
const { check } = require("express-validator");
const validateBody = require("../../middlewares/validateBody");

const loginCheck = [
  check("username").exists(),
  check("password").exists(),
  validateBody()
];

const Auth = models => {
  router = Express.Router();
  router.post("/login", loginCheck, Login(models));
  return router;
};

module.exports = Auth;
