const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

module.exports = (app) => {
  app.post('/auth/validation', [
    check('registerToken')
      .isUUID(),
    check('id')
      .isUUID(),
    validateBody(),
  ]);

  app.post('/auth/validation', async (req, res) => {
    const { User } = req.app.locals.models;
    const { registerToken, id } = req.body;

    try {
      const user = await User.findOne({ where: { id, registerToken } });

      if (!user) {
        log.warn(`can not validate ${registerToken}, user not found`);

        return res
          .status(400)
          .json({ error: 'INVALID_TOKEN' })
          .end();
      }

      await user.update({
        registerToken: null,
      });

      log.info(`user ${user.username} was validated`);

      const token = jwt.sign({ id: user.id }, process.env.ARENA_API_SECRET, {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      });

      log.info(`user ${user.username} logged`);

      return res
        .status(200)
        .json({ id: user.id, token })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};