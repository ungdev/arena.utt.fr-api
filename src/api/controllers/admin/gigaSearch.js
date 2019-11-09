const errorHandler = require('../../utils/errorHandler');
const querySearch = require('../../utils/querySearch');
const { Op } = require('sequelize');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

/**
 * Get a user based on its id
 *
 * GET /admin/users/search
 * {
 *
 * }
 *
 * Response
 * {
 *   [User]
 * }
 *
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} tournamentModel
 */
const Search = (userModel, teamModel, tournamentModel, cartModel, cartItemModel, itemModel) => async (request, response) => {
  try {
    const { search } = request.query;
    const includePay = {
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
    };
    const includeCart = {
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
    }
    const attributes = [
      'id',
      'email',
      'username',
      'firstname',
      'lastname',
      'place',
      'permissions',
      'type',
      'scanned'
    ];
    const { count: countUsers, rows: usersFind} = await userModel.findAndCountAll({
      where: querySearch(search),
      attributes,
      include: [{
        model: teamModel,
        attributes: ['name'],
        include: {
          model: tournamentModel,
          attributes: ['shortName'],
        },
      }, includeCart, includePay]
    });
    const { count: countTeam, rows: usersTeam} = await userModel.findAndCountAll({
      attributes,
      include: [{
        model: teamModel,
        attributes: ['name'],
        where: {
          name: {
            [Op.like]: `%${search}%`,
          }
        },
        include: {
          model: tournamentModel,
          attributes: ['shortName'],
        },
      }, includeCart, includePay]
    });

    const count = countUsers + countTeam;
    const users = [...usersTeam, ...usersFind];

    if (count === 0) {
      return response
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }

    const formatUsers = users.map((user) => ({
      ...user.toJSON(),
      isPaid: user.forUser.length,
    }))

    return response
      .status(200)
      .json({
        users: formatUsers,
        limit: count,
        offset: 0,
        pageSize: count,
        total: count,
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = Search;
