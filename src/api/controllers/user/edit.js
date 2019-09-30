const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const { outputFields, inputFields } = require('../../utils/publicFields');
const log = require('../../utils/log')(module);

/**
 * PUT /user
 * {
 *    name: String
 *    email: String
 *    [password]: String
 * }
 *
 * Response:
 * {
 *    user: User
 * }
 */
// todo: enlever des charactères speciaux ?
module.exports = (app) => {
  app.put('/users/:id', [isAuth()]);

  app.put('/users/:id', [
    check('username')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i)
      .isLength({ min: 3, max: 90 }),
    check('lastname')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i)
      .isLength({ min: 2, max: 200 }),
    check('firstname')
      .matches(/^[A-zÀ-ÿ0-9 '#@!&\-$%]{3,}$/i)
      .isLength({ min: 2, max: 200 }),
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
      if (req.body.password) {
        req.body.password = await bcrypt.hash(
          req.body.password,
          parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
        );
      }

      const body = inputFields(req.body);

      await req.user.update(body);

      log.info(`user ${req.body.name} updated`);

      return res
        .status(200)
        .json({ user: outputFields(req.user) })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
