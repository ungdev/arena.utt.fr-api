const errorHandler = require('../../utils/errorHandler');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;

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
const Get = (userModel, teamModel, cartModel, cartItemModel) => {
    return async (req, res) => {
        try {
            const user = await userModel.findByPk(req.params.userId, {
                attributes: [
                    'id',
                    'username',
                    'firstname',
                    'lastname',
                    'email',
                    'askingTeamId',
                    'type',
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

            const hasCartPaid = await cartModel.count({
                where: {
                    transactionState: 'paid',
                },
                include: [
                    {
                        model: cartItemModel,
                        where: {
                            itemId:
                                user.type === 'visitor'
                                    ? ITEM_VISITOR_ID
                                    : ITEM_PLAYER_ID,
                            forUserId: user.id,
                        },
                    },
                ],
            });
            const isPaid = !!hasCartPaid;

            return res
                .status(200)
                .json({ ...user.toJSON(), isPaid })
                .end();
        } catch (error) {
            return errorHandler(error, res);
        }
    };
};

module.exports = Get;
