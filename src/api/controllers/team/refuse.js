const { check } = require('express-validator/check');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * DELETE /teams/:id/request
 * {
 *    user: UUID
 * }
 *
 * Response:
 * {}
 */
module.exports = (app) => {
  app.delete('/teams/:id/request', [isAuth()]);

  app.delete('/teams/:id/request', [
    check('user')
      .exists(),
    validateBody(),
  ]);

  app.delete('/teams/:id/request', async (req, res) => {
    const { Team, User } = req.app.locals.models;

    try {
      if (req.user.askingTeamId === req.params.id && req.body.user === req.user.id) {
        req.user.askingTeamId = null;
        await req.user.save();

        log.info(`user ${req.user.username} cancel request to team ${req.params.id}`);

        return res
          .status(200)
          .json({})
          .end();
      }
      const team = await Team.findByPk(req.user.teamId);

      if (req.user.id !== team.captainId) {
        return res
          .status(400)
          .json({ error: 'NOT_CAPTAIN' });
      }

      const user = await User.findByPk(req.body.user, {
        where: {
          askingTeamId: req.params.id,
        },
      });
      user.askingTeamId = null;
      await user.save();
      return res
        .status(200)
        .json({})
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
