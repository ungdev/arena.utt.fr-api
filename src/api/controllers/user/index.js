const Express = require('express');

const isAuth = require('../../middlewares/isAuth');

const { Edit, CheckEdit } = require('./edit.js');
const { List, CheckList } = require('./list.js');
const Get = require('./get.js');
const { Register, CheckRegister } = require('./register.js');
const GetTicket = require('./getTicket.js');
const GetUserCart = require('./getUserCart.js');

const userId = 'userId';

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
    router.get(
        '/:userId/ticket',
        [isAuth()],
        GetTicket(models.User, models.CartItem, models.Item, models.Cart)
    );
    router.get(
        `/:${userId}/carts`,
        [isAuth()],
        GetUserCart(
            userId,
            models.Cart,
            models.Item,
            models.CartItem,
            models.Attribute,
            models.User
        )
    );
    return router;
};

module.exports = User;
