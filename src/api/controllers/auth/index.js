const Express = require('express');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');

const ResetPassword = require('./reset-password.js');
const Login = require('./login.js');
const ChangePassword = require('./change-password.js');

const loginCheck = [
  check('username').exists(),
  check('password').exists(),
  validateBody(),
];

const resetCheck = [
  check('email')
    .isEmail()
    .exists(),
  validateBody(),
];

const changePasswordCheck = [
  check('password').isLength({ min: 6 }),
  check('resetToken').isUUID(),
  validateBody(),
];

const Auth = (models) => {
  router = Express.Router();
  router.post('/login', loginCheck, Login(models.User, models.Team));
  router.post('/password/reset', resetCheck, ResetPassword(models.User));
  router.put('/password/update', changePasswordCheck, ChangePassword(models.User));
  return router;
};

module.exports = Auth;
