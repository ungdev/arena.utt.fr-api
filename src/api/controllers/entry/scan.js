const { Op } = require('sequelize');

const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

/**
 * Get a user based on its id
 *
 * POST /entry/scan
 * {
 *
 * }
 *
 * Response
 * {
 *   User
 * }
 *
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} tournamentModel
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Scan = (userModel, teamModel, tournamentModel, cartModel, cartItemModel) => async (req, res) => {
  try {
    const { barcode, search } = req.query;
    const users = await userModel.findAll({
      where: barcode
        ? { barcode }
        : {
          [Op.or]: [
            {
              email: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              username: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              firstname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              lastname: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        },
      include: {
        model: teamModel,
        attributes: ['id', 'name'],
        include: {
          model: tournamentModel,
          attributes: ['shortName'],
        },
      },
    });

    if (users.length > 1) {
      return res
        .status(404)
        .json({ error: 'NOT_FOUND' })
        .end();
    }

    const user = users[0];

    if (user.scanned) {
      return res
        .status(403)
        .json({ error: 'ALREADY_SCANNED' })
        .end();
    }

    const hasCartPaid = await cartModel.count({
      where: {
        transactionState: 'paid',
      },
      include: [
        {
          model: cartItemModel,
          where: {
            itemId:
                user.type === 'visitor' ? ITEM_VISITOR_ID : ITEM_PLAYER_ID,
            forUserId: user.id,
          },
        },
      ],
    });
    const isPaid = !!hasCartPaid;

    if (!isPaid) {
      return res
        .status(403)
        .json({ error: 'NOT_PAID' })
        .end();
    }

    await user.update({ scanned: true });

    return res
      .status(200)
      .json(user)
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = Scan;
