const Express = require('express');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');

const ResetPassword = require('./reset-password.js');
const { Login, CheckLogin } = require('./login.js');
const { ChangePassword, CheckChangePassword } = require('./change-password.js');
const { Register, CheckRegister } = require('./register.js');

const resetCheck = [
    check('email')
        .isEmail()
        .exists(),
    validateBody(),
];

const Auth = models => {
    router = Express.Router();
    router.post(
        '/login',
        CheckLogin,
        Login(models.User, models.Team, models.Cart, models.CartItem)
    );
    router.post('/password/reset', resetCheck, ResetPassword(models.User));
    router.put(
        '/password/update',
        CheckChangePassword,
        ChangePassword(models.User)
    );
    router.post('/register', CheckRegister, Register(models.User));
    return router;
};

module.exports = Auth;
