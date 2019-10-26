const Express = require('express');

const isAuth = require('../../middlewares/isAuth.js');

const CreateCart = require('./create.js');
const { AddItemToCart, CheckAddItem } = require('./add-item.js');

const cartId = 'cartId';
  const router = Express.Router();
  router.post('/', CreateCart(models.Cart));
    router.post(
        `/:${cartId}/add`,
        [CheckAddItem],
        AddItemToCart(cartId, models.CartItem, models.User, models.Cart)
    );
  return router;
};

module.exports = Cart;
