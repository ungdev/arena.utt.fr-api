const isAuth = require('../../middlewares/isAuth');

module.exports = (app) => {
  app.get('/users/:userId/carts', isAuth());

  app.get('/users/:userId/carts', async (req, res) => {
    const { Cart, Item, CartItem, Attribute } = req.app.locals.models;

    if (req.params.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }

    const carts = await Cart.findAll({
      attributes: ['id', 'paidAt', 'transactionId', 'transactionState'],
      where: {
        userId: req.params.userId,
      },

      include: {
        model: CartItem,
        attributes: ['id', 'quantity', 'forUserId', 'userId'],
        include: [{
          model: Item,
          attributes: ['name', 'key', 'price', 'stock', 'infos'],
        }, {
          model: Attribute,
          attributes: ['label', 'value'],
        }],
      },
    });

    return res
      .status(200)
      .json(carts)
      .end();
  });
};