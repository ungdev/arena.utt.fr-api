const { check } = require('express-validator/check');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isCaptain = require('../../middlewares/isCaptain');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /teams/:id/users
 * {
 *   user: UUID
 * }
 *
 * Response:
 * {
 *
 * }
 */
module.exports = (app) => {
  app.post('/teams/:id/users', [
    isAuth(),
    isCaptain(),
  ]);

  app.post('/teams/:id/users', [
    check('user')
      .exists()
      .isUUID(),
    validateBody(),
  ]);

  app.post('/teams/:id/users', async (req, res) => {
    try {
      const { User, Team, Tournament } = req.app.locals.models;
      const team = await Team.findByPk(req.params.id, {
        include: [{
          model: User,
        }, {
          model: Tournament,
          attributes: ['playersPerTeam'],
        }],
      });
      const user = await User.findByPk(req.body.user, {
        where: {
          askingTeamId: team.id,
        },
      });

      if (team && team.users.length === team.tournament.playersPerTeam) {
        return res.status(400).json({ error: 'TEAM_FULL' }).end();
      }
      if (user) {
        user.teamId = team.id;
        user.askingTeamId = null;
        await user.save();

        log.info(`user ${req.user.username} accepted user ${user.username}`);

        return res
          .status(200)
          .json({})
          .end();
      }
      return res.status(404).json({ error: 'NOT_ASKING_USER' }).end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};