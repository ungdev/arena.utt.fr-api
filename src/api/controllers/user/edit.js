const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

const CheckEdit = [
    check('username').isLength({ min: 3, max: 100 }),
    check('lastname').isLength({ min: 2, max: 100 }),
    check('firstname').isLength({ min: 2, max: 100 }),
    check('oldpassword')
        .optional()
        .isLength({ min: 6 }),
    check('password')
        .optional()
        .isLength({ min: 6 }),
    validateBody(),
];

/**
 * PUT /users/:id
 * {
 *   username: String
 *   lastname: String
 *   firstname: String
 *   (password): String,
 *   (oldPassword): String
 * }
 *
 * Response
 * {
 *
 * }
 */
const Edit = () => {
    return async (req, res) => {
        try {
            // todo: refaire pour admins
            if (req.params.userId !== req.user.id) {
                return res
                    .status(403)
                    .json({ error: 'UNAUTHORIZED' })
                    .end();
            }

            if (req.body.password && req.body.oldpassword) {
                req.body.oldpassword = await bcrypt.hash(
                    req.body.oldpassword,
                    parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10)
                );

                const passwordMatches = bcrypt.compare(
                    req.body.oldpassword,
                    req.user.password
                );

                if (!passwordMatches) {
                    return res
                        .status(400)
                        .json({ error: 'WRONG_PASSWORD' })
                        .end();
                }

                req.body.password = await bcrypt.hash(
                    req.body.password,
                    parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10)
                );
            }

            const { firstname, lastname, username, password } = req.body;
            const userUpdated = {
                id: req.params.id,
                username,
                firstname,
                lastname,
                password,
            };

            await req.user.update(userUpdated);

            log.info(`user ${req.body.name} updated`);

            return res
                .status(200)
                .json(userUpdated)
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { Edit, CheckEdit };
