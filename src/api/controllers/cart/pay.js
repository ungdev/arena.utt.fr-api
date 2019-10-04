const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});

const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

const euro = 100;
const { Basket } = etupay;

module.exports = (app) => {
  app.post('/users/:userId/carts/:id/pay', [isAuth()]);


  app.post('/users/:userId/carts/:id/pay', async (req, res) => {
    const { Cart, CartItem, Item, Attribute } = req.app.locals.models;

    try {
      const cart = await Cart.findOne({
        where: {
          id: req.params.id,
          userId: req.params.userId,
          transactionState: 'draft',
        },

        include: {
          model: CartItem,
          attributes: ['id', 'quantity', 'forUserId'],
          include: [{
            model: Item,
            attributes: ['name', 'key', 'price', 'stock', 'infos'],
          }, {
            model: Attribute,
            attributes: ['label', 'value'],
          }],
        },
      });

      if (!cart) {
        return res
          .status(404)
          .json({ error: 'NOT_FOUND' })
          .end();
      }

      const data = JSON.stringify({ userId: req.user.id, isInscription: true, orderId: cart.id });
      const encoded = Buffer.from(data).toString('base64');

      const basket = new Basket(
        'Inscription UTT Arena',
        req.user.firstname,
        req.user.lastname,
        req.user.email,
        'checkout',
        encoded,
      );

      cart.cartItems.forEach((cartItem) => {
        const name = cartItem.attribute ? `${cartItem.item.name} (${cartItem.attribute.label})` : cartItem.item.name;
        basket.addItem(name, cartItem.item.price * euro, cartItem.quantity);
      });

      return res
        .status(200)
        .json({ url: basket.compute() })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};