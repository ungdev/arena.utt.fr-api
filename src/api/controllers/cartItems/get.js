const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /carts/:cartId/cartItems
 * {
 *
 * }
 * Response
 * {
 *   CartItem
 * }
 */
module.exports = (app) => {
  app.get('/carts/:cartId/cartItems/:id', [isAuth()]);

  app.get('/carts/:cartId/cartItems/:id', async (req, res) => {
    const { CartItem, Item, Attribute } = req.app.locals.models;

    try {
      const cartItem = await CartItem.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        attributes: ['id', 'quantity', 'forUserId'],
        include: [{
          model: Item,
          attributes: ['name', 'key', 'price', 'stock', 'infos'],
        }, {
          model: Attribute,
          attributes: ['label', 'value'],
        }],

      });

      return res
        .status(200)
        .json(cartItem)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};