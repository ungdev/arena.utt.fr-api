const { check } = require('express-validator');

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const validateBody = require('../../middlewares/validateBody');

/**
 * POST /carts/:cartId/cartitems
 * {
 *  itemId: int
 *  quantity: int
 *  attributeId: int, optionnal
 *  forUserId: UUID, optionnal. For self if null
 * }
 * Response
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/carts/:cartId/cartitems', isAuth());

  app.post('/carts/:cartId/cartitems', [
    check('itemId')
      .isInt(),
    check('quantity')
      .isInt(),
    check('attributeId')
      .optional()
      .isInt(),
    check('forUserId')
      .optional()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/carts/:cartId/cartitems', async (req, res) => {
    const { CartItem, User, Cart } = req.app.locals.models;

    try {
      if (req.body.forUserId) {
        const user = User.findByPk(req.body.forUserId);
        if (!user) {
          return res
            .status(404)
            .json({ error: 'USER_NOT_FOUND' })
            .end();
        }
      }
      else req.body.forUserId = req.user.id;

      // A modifier après pour l'admin
      const cartCount = await Cart.count({
        where: {
          id: req.params.cartId,
          userId: req.user.id,
        },
      });

      if (cartCount !== 1) {
        return res
          .status(403)
          .json({ error: 'UNAUTHORIZED' })
          .end();
      }

      const cartItem = {
        ...req.body,
        userId: req.user.id,
        cartId: req.params.cartId,
      };

      await CartItem.create(cartItem);

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};