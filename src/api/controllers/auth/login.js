const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { check } = require('express-validator');

const log = require('../../utils/log.js')(module);
const errorHandler = require('../../utils/errorHandler');
const hasCartPaid = require('../../utils/hasCartPaid');
const validateBody = require('../../middlewares/validateBody');
const redis = require('../../utils/redis.js');
const getIP = require('../../utils/getIP.js');

const CheckLogin = [
  check('username').exists(),
  check('password').exists(),
  validateBody(),
];

/**
 * Authenticate a user based on his email/username and password
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
 * @param {object} userModel
 * @param {object} teamModel
 * @param {object} cartModel
 * @param {object} cartItemModel
 */
const Login = (userModel, teamModel, cartModel, cartItemModel) => async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user
    const user = await userModel.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
      },
      include: {
        model: teamModel,
        attributes: ['id', 'name', 'tournamentId'],
      },
    });

    const validCredentials = user && await bcrypt.compare(
      password,
      user.password,
    );

    if (!validCredentials) {
      log.warn(`invalid credentials for ${username}`);

      return res
        .status(400)
        .json({ error: 'INVALID_CREDENTIALS' })
        .end();
    }

    // Check if account is activated
    if (user.registerToken) {
      log.warn(`user ${username} tried to login before activating`);

      return res
        .status(400)
        .json({ error: 'USER_NOT_ACTIVATED' })
        .end();
    }

    // Generate new token
    const token = jwt.sign(
      { id: user.id },
      process.env.ARENA_API_SECRET,
      {
        expiresIn: process.env.ARENA_API_SECRET_EXPIRES,
      },
    );
    const isPaid = await hasCartPaid(user, cartModel, cartItemModel);

    log.info(`user ${user.username} logged`);

    /********************/
    /** Captive portal **/
    /********************/
    let captivePortalSuccess = false;
    const ip = getIP(req);
    const ipParts = ip.split('.').map((e) => parseInt(e));
    const isInUnconnectedNetwork = (
      ipParts[0] === 172 &&
      ipParts[1] === 16 &&
      (ipParts[2] >= 188 && ipParts[2] <= 191) &&
      (ipParts[3] >= 0 && ipParts[3] <= 255)
    );

    const isValidPlayer = user.team && user.team.tournamentId !== 5 && user.place;
    const isOrga = !!user.permissions;

    if (isInUnconnectedNetwork) {
      if (isValidPlayer || isOrga) {
        await new Promise((resolve) => {
          // Replace dots in IP address by dashes
          const userRedisIP = ip.replace(/\./g, '-');

          // Get MAC of the user from its IP
          redis.get(userRedisIP, async (err, mac) => {
            if (err || !mac) {
              const error = !mac ? `no mac associated to ${userRedisIP} in redis` : JSON.stringify(err);
              log.error(`captive portal error : ${error}`);
              // Just quit this function and don't throw an error
              resolve();
              return;
            }

            let network;
            if(isValidPlayer) {
              switch(user.team.tournamentId) {
                case 1:
                  network = 'lol-pro';
                  break;
                case 2:
                  network = 'lol-amateur';
                  break;
                case 3:
                  network = 'fortnite';
                  break;
                case 4:
                  network = 'csgo';
                  break;
                case 6:
                  network = 'osu';
                  break;
                case 7:
                  network = 'libre';
                  break;
              }
            }
            else if(isOrga) {
              network = 'staff';
            }

            if(!network) {
              return;
            }

            await new Promise((resolve) => {
              // Associate to MAC: { network, firstname, lastname, username, email, place }
              redis.set(
                mac,
                JSON.stringify({
                  network,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  username: user.username,
                  email: user.email,
                  place: user.place,
                }),
                resolve,
              );
            });

            captivePortalSuccess = true;
            log.info(`captive portal successful for ${user.username}, mac = ${mac}`);
            resolve();
          });
        });
      }
      else {
        log.warn('captive portal refused : not a valid player or orga');
      }
    }

    return res
      .status(200)
      .json({
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          team: user.team ? {
            id: user.team && user.team.id,
            name: user.team && user.team.name,
          } : null,
          type: user.type,
          permissions: user.permissions,
          isPaid,
        },
        token,
        captivePortalSuccess,
      })
      .end();
  }
  catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { Login, CheckLogin };
