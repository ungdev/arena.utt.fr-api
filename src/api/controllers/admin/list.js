const { Op, literal, col } = require('sequelize');
const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

/**
 * GET /admin/users
 * {
 *
 * }
 * Response
 * {
 *   Users
 * }
 * @param {object} infoModel model to query Infos
 * @param {object} teamModel model to query Infos
 * @param {object} tournamentModel model to query Infos
 */
const List = (userModel, teamModel, tournamentModel, cartModel, cartItemModel) => async (req, res) => {
  const page = req.query.page || 0;
  const pageSize = 25;
  const offset = page * pageSize;
  const limit = pageSize;
  const filterTournament = req.query.tournamentId === 'all' ? undefined : req.query.tournamentId;
  const filterStatus = req.query.status === 'all' ? undefined : req.query.status;
  const customWhere = filterStatus && literal(
    filterStatus === 'paid' ?
    'forUser.id IS NOT NULL' :
    'forUser.id IS NULL'
  );

  try {
    const includeTeam = {
      model: teamModel,
      attributes: ['name'],
      where: filterTournament && {
        tournamentId: filterTournament,
      },
      include: {
        model: tournamentModel,
        attributes: ['shortName'],
      },
    };
    const includeCart = {
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
          where: filterStatus === 'paid' && {
            transactionState: 'paid'
          },
        }
      ]
    };
    const countUsers = await userModel.count({
      include:  [includeTeam, includeCart],
      where: customWhere,
    });
    const users = await userModel.findAll({
      limit,
      offset,
      subQuery: false,
      include: [includeCart, includeTeam],
      attributes: [
        'id',
        'email',
        'username',
        'firstname',
        'lastname',
        'place',
        'permissions',
        'type',
      ],
      where: customWhere,
      order: [filterTournament ? [col('team.name'),'ASC'] : ['username', 'ASC']],
    });

    const formatUsers = users.map((user) => ({
      ...user.toJSON(),
      isPaid: user.forUser.length,
    }))

    return res
      .status(200)
      .json({
        users: formatUsers,
        pageSize,
        offset,
        limit,
        total: countUsers,
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = List;
