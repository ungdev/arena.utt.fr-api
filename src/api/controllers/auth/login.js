const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const log = require("../../utils/log")(module);
const errorHandler = require("../../utils/errorHandler");

/**
 * PUT /user/login
 * {
 *    username: String
 *    password: String
 * }
 *
 * Response:
 * {
 *    user: User,
 *    token: String
 * }
 */
const Login = models => {
  return async (request, response) => {
    const { User, Team } = models;
    try {
      const { username, password } = request.body;

      // Get user
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: username }]
        },
        include: {
          model: Team,
          attributes: ["id", "name"]
        }
      });

      if (!user) {
        log.warn(`user ${username} couldn't be found`);

        return response
          .status(400)
          .json({ error: "INVALID_USERNAME" })
          .end();
      }

      // Check for password
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        log.warn(`user ${username} password didn't match`);

        return response
          .status(400)
          .json({ error: "INVALID_PASSWORD" })
          .end();
      }

      // Check if account is activated
      if (user.registerToken) {
        log.warn(`user ${username} tried to login before activating`);

        return response
          .status(400)
          .json({ error: "USER_NOT_ACTIVATED" })
          .end();
      }

      // Generate new token
      const token = jwt.sign({ id: user.id }, process.env.ARENA_API_SECRET, {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES
      });

      log.info(`user ${user.username} logged`);

      return response
        .status(200)
        .json({
          user: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            team: user.team
          },
          token
        })
        .end();
    } catch (err) {
      return errorHandler(err, response);
    }
  };
};

module.exports = Login;
