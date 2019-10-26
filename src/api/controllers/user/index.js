const Express = require('express');

const isAuth = require('../../middlewares/isAuth');

const { Edit, CheckEdit } = require('./edit.js');
const { List, CheckList } = require('./list.js');
const Get = require('./get.js');
const GetTicket = require('./getTicket.js');
const GetUserCart = require('./getUserCart.js');
const ListCartsFromUser = require('./list-carts.js');
const PayCart = require('./pay-cart.js');

const userId = 'userId';
const cartId = 'cartId';

const User = models => {
    const router = Express.Router();
    router.put('/:userId', [CheckEdit], Edit(models.Cart, models.ItemModel));
    router.get(
        '/:userId',
        Get(models.User, models.Team, models.Cart, models.CartItem)
    );
    router.get(
        '/',
        [CheckList],
        List(
            models.User,
            models.Team,
            models.Tournament,
            models.Cart,
            models.CartItem
        )
    );
    router.get(
        '/:userId/ticket',
        GetTicket(models.User, models.CartItem, models.Item, models.Cart)
    );
    router.get(
        `/:${userId}/carts`,
        GetUserCart(
            userId,
            models.Cart,
            models.Item,
            models.CartItem,
            models.Attribute,
            models.User
        )
    );
    router.get(
        `/:${userId}/carts`,
        ListCartsFromUser(
            userId,
            models.Cart,
            models.Item,
            models.CartItem,
            models.Attribute
        )
    );
    router.post(
        `/:${userId}/carts/:${cartId}/pay`,
        PayCart(
            userId,
            cartId,
            models.User,
            models.Tournament,
            models.Team,
            models.Item,
            models.Cart,
            models.CartItem,
            models.Attribute
        )
    );
    return router;
};

module.exports = User;
