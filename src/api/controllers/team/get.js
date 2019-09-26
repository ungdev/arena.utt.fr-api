const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

/**
 * GET /teams/:id
 *
 * Response:
 *  Team
 */
module.exports = (app) => {
  app.get('/teams/:id', [isAuth()]);

  app.get('/teams/:id', async (req, res) => {
    const { Team, User } = req.app.locals.models;

    try {
      const team = await Team.findByPk(req.params.id, {
        include: [{
          model: User,
        }],
        order: [
          ['name', 'ASC'],
        ],
      });
      const users = team.users.map((user) => user.username);
      return res
        .status(200)
        .json({ ...team.toJSON(), users })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
