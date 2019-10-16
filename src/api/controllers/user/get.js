const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
/**
 * GET /users/:id
 * {
 *
 * }
 *
 * Response
 * {
 *   User
 * }
 */
// todo: admin chekc
const Get = (userModel, teamModel) => {
    return async (req, res) => {
        const userId = req.params.userId;
        try {
            const user = await userModel.findByPk(userId, {
                attributes: [
                    'id',
                    'username',
                    'firstname',
                    'lastname',
                    'email',
                    'askingTeamId',
                ],
                include: {
                    model: teamModel,
                    attributes: ['id', 'name'],
                },
            });

            if (!user)
                return res
                    .status(404)
                    .json({ error: 'NOT_FOUND' })
                    .end();
            if (userId !== user.id) {
                return res
                    .status(403)
                    .json({ error: 'UNAUTHORIZED' })
                    .end();
            }

            return res
                .status(200)
                .json(user)
                .end();
        } catch (error) {
            return errorHandler(error, res);
        }
    };
};

module.exports = Get;
