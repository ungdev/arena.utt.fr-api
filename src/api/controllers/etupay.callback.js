const { fn } = require('sequelize');
const etupay = require('@ung/node-etupay')({
  id: process.env.ARENA_ETUPAY_ID,
  url: process.env.ARENA_ETUPAY_URL,
  key: process.env.ARENA_ETUPAY_KEY,
});
const generatePdf = require('../utils/sendPDF');
const errorHandler = require('../utils/errorHandler');

module.exports = (app) => {
  app.post('/user/pay/callback', (req, res) => res.status(204));

  app.get('/user/pay/return', etupay.middleware, async (req, res) => {
    // Jamais utilisée car géré par le middleware

    const { Cart, CartItem, Item, Attribute, User, Team, Tournament } = req.app.locals.models;

    try {
      if (!req.query.payload) {
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}&error=NO_PAYLOAD`);
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
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}&error=CART_NOT_FOUND`);
      }

      cart.transactionState = req.etupay.step;
      cart.transactionId = req.etupay.transactionId;

      if (cart.transactionState !== 'paid') {
        await cart.save();
        return res.redirect(`${process.env.ARENA_ETUPAY_ERRORURL}&error=TRANSACTION_ERROR`);
      }

      cart.paidAt = fn('NOW');
      // todo: warning DEV
      //await cart.save();


      let pdfTickets = await Promise.all(cart.cartItems.map(async (cartItem) => {
        if (cartItem.item.key === 'player' || cartItem.item.key === 'visitor') {
          // todo: moche à cause de seuquelize, peut etre moyen de raccourcir en une requête
          const forUser = await User.findByPk(cartItem.forUserId);
          console.log(cartItem.item.name);
          return generatePdf(forUser);
        }
        return null;
      }));

      pdfTickets = pdfTickets.filter((ticket) => ticket !== null);


      console.log(pdfTickets.length);


      /*
      tickets = map(ticket)
        genereatePdf(ticker)

      SEND PAYEMETN MAIL(tickets)

      */


      // todo: DEV
      return res
        .status(200)
        .json(pdfTickets.length)
        .end();

      // return res.redirect(process.env.ARENA_ETUPAY_SUCCESSURL);
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
