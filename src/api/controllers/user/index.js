const Express = require('express');

const { Edit, CheckEdit } = require('./edit.js');
const { List, CheckList } = require('./list.js');
const Get = require('./get.js');
const { Register, CheckRegister } = require('./register.js');
const isAuth = require('../../middlewares/isAuth');

const User = models => {
    const router = Express.Router();
    router.put(
        '/:userId',
        [isAuth(), ...CheckEdit],
        Edit(models.Cart, models.ItemModel)
    );
    router.get(
        '/:userId',
        isAuth(),
        Get(models.User, models.Team, models.Cart, models.CartItem)
    );
    router.get(
        '/',
        [isAuth(), ...CheckList],
        List(
            models.User,
            models.Team,
            models.Tournament,
            models.Cart,
            models.CartItem
        )
    );
    router.post('/', CheckRegister, Register(models.User));
    return router;
};

module.exports = User;
