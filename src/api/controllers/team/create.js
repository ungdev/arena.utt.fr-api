const { check } = require('express-validator/check');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isNotInTeam = require('../../middlewares/isNotInTeam');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

/**
 * POST /team
 * {
 *    name: String
 * }
 *
 * Response:
 * {
 *    team: Team
 * }
 */
module.exports = (app) => {
  app.post('/teams', [isAuth(), isNotInTeam()]);

  app.post('/teams', [
    check('name')
      .exists()
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i),
    check('tournament')
      .exists()
      .matches(/\d/),
    validateBody(),
  ]);

  app.post('/teams', async (req, res) => {
    const { Tournament, Team, User } = req.app.locals.models;

    try {
      const tournament = await Tournament.findByPk(req.body.tournament, {
        include: [
          {
            model: Team,
            include: [User],
          },
        ],
      });

      // if (isTournamentFull(tournament)) {
      //   return res
      //     .status(400)
      //     .json({ error: 'SPOTLIGHT_FULL' })
      //     .end();
      // }

      const team = await Team.create({
        name: req.body.name,
      });
      await team.addUser(req.user);
      await team.setCaptain(req.user);
      await tournament.addTeam(team);
      await req.user.save();

      log.info(`user ${req.user.username} created team ${req.body.name}`);

      return res
        .status(200)
        .json({ ...team.toJSON(), tournament: tournament.toJSON() })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
