const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

module.exports = (app) => {
  app.put('/users/:id', [isAuth()]);

  app.put('/users/:id', [
    check('username')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]*$/i)
      .isLength({ min: 3, max: 100 }),
    check('lastname')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]*$/i)
      .isLength({ min: 2, max: 100 }),
    check('firstname')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]*$/i)
      .isLength({ min: 2, max: 100 }),
    check('password')
      .optional()
      .isLength({ min: 6 }),
    check('email')
      .exists()
      .isEmail(),
    validateBody(),
  ]);

  app.put('/users/:id', async (req, res) => {
    try {
      // todo: refaire pour admins
      if (req.params.id !== req.user.id) return res.status(403).json({ error: 'UNAUTHORIZED' }).end();

      if (req.body.password) {
        req.body.password = await bcrypt.hash(
          req.body.password,
          parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
        );
      }

      const { firstname, lastname, username, password } = req.body;
      const body = {
        id: req.params.id,
        username,
        firstname,
        lastname,
        password,
      };

      await req.user.update(body);

      log.info(`user ${req.body.name} updated`);

      return res
        .status(204)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
