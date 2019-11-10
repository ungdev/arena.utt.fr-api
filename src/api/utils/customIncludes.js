const { Op } = require('sequelize');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

const includePay = (cartItemModel, cartModel) => ({
  model: cartItemModel,
  as: 'forUser',
  attributes: ['id'],
  required: false,
  where: {
    [Op.or]: [
      { itemId: ITEM_PLAYER_ID },
      { itemId: ITEM_VISITOR_ID }
    ],
  },
  include: [
    {
      model: cartModel,
      as: 'cart',
      attributes: [],
      where: {
        transactionState: 'paid'
      },
    }
  ]
});

const includeCart = (cartModel, cartItemModel, itemModel) => ({
  model: cartModel,
  attributes: ['transactionId', 'paidAt'],
  required: false,
  separate: true,
  where: {
    transactionState: 'paid'
  },
  include: [{
    model: cartItemModel,
    attributes: ['quantity', 'refunded'],
    include: [{
      model: itemModel,
      attributes: ['name']
    }]
  }]
});

module.exports = { includeCart, includePay };