const { Op } = require('sequelize');

const errorHandler = require('../../utils/errorHandler');

/**
 * Get a user based on its id
 *
 * GET /entry/user
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
 */
const Search = (userModel, teamModel, tournamentModel) => async (req, res) => {
  try {
    const { search } = req.query;
    const users = await userModel.findAll({
      where: {
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

    return res
      .status(200)
      .json(user)
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = Search;
