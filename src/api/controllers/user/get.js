const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');

// todo: admin chekc
module.exports = (app) => {
  app.get('/users/:id', isAuth());

  app.get('/users/:id', async (req, res) => {
    const { User } = req.app.locals.models;

    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'firstname', 'lastname'],
      });

      if (!user) return res.status(404).end();
      if (req.id !== user.id) return res.status(403).end();



      return res
        .status(200)
        .json(user)
        .end();
    }

    catch (error) {
      return errorHandler(error);
    }
  });
};