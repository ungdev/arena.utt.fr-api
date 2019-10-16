const Express = require('express');

const isAuth = require('../../middlewares/isAuth.js');

const CreateCart = require('./create.js');

const Cart = (models) => {
  const router = Express.Router();
  router.post('/', CreateCart(models.Cart));
  return router;
};

module.exports = Cart;
