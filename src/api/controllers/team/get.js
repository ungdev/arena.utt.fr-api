const errorHandler = require('../../utils/errorHandler');
const { APIToornament } = require('../../utils/APIToornament');

const ticketId = 1;
/**
 * Return the user's team. The user should be in the team, other wise
 * he cannot access this infos
 *
 * GET /teams/:id
 *
 * @param {string} teamidString name of the id to get from the url
 * @param {object} teamModel model for Team
 * @param {object} userModel model for User
 * @param {object} tournamentModel model for  Tournament
 * @param {object} cartModel model for Cart
 * @param {object} cartItemModel model for CartItem
 */
const Get = (
  teamIdString,
  teamModel,
  userModel,
  tournamentModel,
  cartModel,
  cartItemModel,
) => async (req, res) => {
  const teamId = req.params[teamIdString];
  try {
    const includeCart = {
      model: cartItemModel,
      as: 'forUser',
      attributes: ['id'],
      required: false,
      where: {
        itemId: 1,
      },
      include: [
        {
          model: cartModel,
          as: 'cart',
          attributes: [],
          where: {
            transactionState: 'paid',
          },
        },
      ],
    };
    const team = await teamModel.findOne({
      where: {
        id: teamId,
      },
      attributes: ['id', 'captainId', 'name', 'toornamentId'],
      include: [
        {
          model: userModel,
          attributes: ['id', 'username', 'email'],
          include: [includeCart],
        },
        {
          model: tournamentModel,
          attributes: ['id', 'playersPerTeam', 'name', 'toornamentId']
        },
      ],
    });
    // TODO: C'est moche je pense avec sequelize on peut faire mieux
    let askingUsers = await userModel.findAll({
      where: { askingTeamId: teamId },
    });

    let matches = [];
    if (team.toornamentId) {
      const matchesToornament = await APIToornament.matches({ toornamentTeam: team.toornamentId, toornamentId: team.tournament.toornamentId });
      matches = matchesToornament.data.map((match) => {
        const formatOpponents = match.opponents.map((opponent) => ({
          name: opponent.participant.name,
          result: opponent.result,
          score: opponent.score,
        }));
        return { opponents: formatOpponents, note: match.private_note, id: match.id }
      })
    }

    if (team) {
      const users = team.users.map((user) => ({ ...user.toJSON(), isPaid: user.forUser.length }));
      askingUsers = askingUsers.map(({ username, email, id }) => ({
        username,
        email,
        id,
      }));
      return res
        .status(200)
        .json({ ...team.toJSON(), users, askingUsers, matches })
        .end();
    }
    return res
      .status(404)
      .json({ error: 'NOT_FOUND' })
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = Get;
