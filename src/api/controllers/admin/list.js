const { literal, col } = require('sequelize');
const { check } = require('express-validator');
const errorHandler = require('../../utils/errorHandler');
const { includePay, includeCart } = require('../../utils/customIncludes');
const validateBody = require('../../middlewares/validateBody');

const CheckList = [
  check('page').isInt().optional(),
  check('tournamentId').optional(),
  check('status').isIn(['all','paid','noPaid']).optional(),
  check('scan').isIn(['all','true','false']).optional(),
  validateBody(),
];

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
const List = (userModel, teamModel, tournamentModel, cartModel, cartItemModel, itemModel) => async (req, res) => {
  const page = req.query.page || 0;
  const pageSize = 25;
  const offset = page * pageSize;
  const limit = pageSize;
  const filterTournament = req.query.tournamentId === 'all' ? undefined : req.query.tournamentId;
  const filterScan = req.query.scan === 'all' ? undefined : req.query.scan;
  const customScan = filterScan ? ` AND user.scanned IS ${filterScan}` : '';
  let customWhere = undefined;
  switch (req.query.status) {
    case 'paid':
      customWhere = literal(`forUser.id IS NOT NULL ${customScan}`);
      break;
    case 'noPaid':
      customWhere = literal('forUser.id IS NULL');
      break;
    case 'orga':
      customWhere = literal('user.permissions IS NOT NULL');
    default:
      break;
  }

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

    const {rows: users, count: countUsers} = await userModel.findAndCountAll({
      limit,
      offset,
      subQuery: false,
      include: [
        includeTeam,
        includeCart(cartModel, cartItemModel, itemModel, userModel),
        includePay(cartItemModel, cartModel, userModel),
      ],
      attributes: [
        'id',
        'email',
        'username',
        'firstname',
        'lastname',
        'place',
        'permissions',
        'type',
        'scanned'
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

module.exports = { List, CheckList };
