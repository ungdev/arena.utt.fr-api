const uuid = require('uuid');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);
const sendMail = require('../../mail/reset');

/**
 * POST /auth/reset
 * {
 *    email: String
 * }
 *
 * Response:
 * {
 *
 * }
 *
 * PUT /auth/reset
 * {
 *    token: String,
 *    password: String
 * }
 */
const ResetPassword = (userModel) => async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ where: { email } });

    if (!user) {
      log.warn(`can not reset ${email}, user not found`);

      return res
        .status(400)
        .json({ error: 'INVALID_EMAIL' })
        .end();
    }

    await user.update({
      resetToken: uuid(),
    });

    // await sendMail(user.email, {
    //  username: user.username,
    //  link: `${process.env.ARENA_WEBSITE}}/password/change/${user.resetToken}`
    // });

    log.info(`user ${user.username} asked for mail reset`);

    return res.status(204).end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = ResetPassword;
