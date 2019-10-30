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
  const limit = offset + pageSize;
  const filterTournament = req.query.tournamentId || undefined;
  try {
    const include = {
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
    const countUsers = await userModel.count({ include });
    const users = await userModel.findAll({
      offset,
      limit,
      include,
      attributes: ['id', 'email', 'username', 'firstname', 'lastname', 'place', 'permissions', 'type'],
      order: [['username', 'ASC']],
    });

    const formatUsers = await Promise.all(users.map(async (user) => {
      const hasCartPaid = await cartModel.count({
        where: {
          transactionState: 'paid',
        },
        include: [
          {
            model: cartItemModel,
            where: {
              itemId:
                user.type === 'visitor'
                  ? ITEM_VISITOR_ID
                  : ITEM_PLAYER_ID,
              forUserId: user.id,
            },
          },
        ],
      });
      return { ...user.toJSON(), isPaid: !!hasCartPaid };
    }));

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
