const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');
const isCaptain = require('../../middlewares/isCaptain');
const isType = require('../../middlewares/isType');
const errorHandler = require('../../utils/errorHandler');
const log = require('../../utils/log')(module);

const CheckAddUser = [check('user').isUUID(), validateBody()];
/**
 * POST /teams/:id/users
 * {
 *   user: UUID
 * }
 *
 * Response:
 * {
 *
 * }
 */
const AddUser = (teamIdString, userModel, teamModel, tournamentModel) => {
    return async (req, res) => {
        try {
            const team = await teamModel.findByPk(req.params[teamIdString], {
                include: [
                    {
                        model: userModel,
                        attributes: ['id']
                    },
                    {
                        model: tournamentModel,
                        attributes: ['playersPerTeam']
                    }
                ]
            });
            const user = await userModel.findByPk(req.body.user, {
                where: {
                    askingTeamId: team.id
                }
            });

            if (team && team.users.length === team.tournament.playersPerTeam) {
                return res
                    .status(400)
                    .json({ error: 'TEAM_FULL' })
                    .end();
            }
            if (user) {
                user.teamId = team.id;
                user.askingTeamId = null;
                user.type = 'player';
                await user.save();

                log.info(
                    `user ${req.user.username} accepted user ${user.username}`
                );

                return res.status(200).end();
            }
            return res
                .status(404)
                .json({ error: 'NOT_ASKING_USER' })
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = { AddUser, CheckAddUser };
