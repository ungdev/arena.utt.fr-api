const {fn} = require('sequelize');
const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});

const errorHandler = require('../utils/errorHandler');

module.exports = (app) => {
  app.post('/user/pay/callback', (req, res) => res.status(204));

  app.get('/user/pay/return', etupay.middleware, async (req, res) => {
    // Jamais utilisée car géré par le middleware

    const { Cart, CartItem, Item, Attribute } = req.app.locals.models;

    try {
      if (!req.query.payload) {
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}?error=NO_PAYLOAD`);
      }

      // Récupère le cartId depuis le payload envoyé à /carts/:id/pay
      const { cartId } = JSON.parse(Buffer.from(req.etupay.serviceData, 'base64').toString());

      const cart = await Cart.findOne({
        where: {
          id: cartId,
          transactionState: 'draft',
        },

        include: {
          model: CartItem,
          attributes: ['id', 'quantity', 'forUserId'],
          include: [{
            model: Item,
            attributes: ['name', 'key', 'price', 'infos'],
          }, {
            model: Attribute,
            attributes: ['label', 'value'],
          }],
        },
      });

      if (!cart) {
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}?error=CART_NOT_FOUND`);
      }


      cart.transactionState = req.etupay.step;
      cart.transactionId = req.etupay.transactionId;

      if (cart.transactionState !== 'paid') {
        await cart.save();
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}?error=TRANSACTION_ERROR`);
      }

      cart.paidAt = fn('NOW');

      await cart.save();

      /*
      tickets = map(ticket)
        genereatePdf(ticker)

      SEND PAYEMETN MAIL(tickets)

      */


      return res.redirect(process.env.ARENA_ETUPAY_SUCCESSURL);
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
