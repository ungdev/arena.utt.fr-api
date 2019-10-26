const Express = require('express');

const isAuth = require('../../middlewares/isAuth.js');

const CreateCart = require('./create.js');
const { AddItemToCart, CheckAddItem } = require('./add-item.js');
const { Edit, CheckEdit } = require('./edit.js');

const cartId = 'cartId';
const itemId = 'itemId';
  const router = Express.Router();
  router.post('/', CreateCart(models.Cart));
    router.post(
        `/:${cartId}/add`,
        [CheckAddItem],
        AddItemToCart(cartId, models.CartItem, models.User, models.Cart)
    );
    router.put(
        `/:${cartId}/cartItems/:${itemId}`,
        CheckEdit,
        Edit(cartId, itemId, models.CartItem, models.User)
    );
  return router;
};

module.exports = Cart;
