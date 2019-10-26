const errorHandler = require('../../utils/errorHandler');

/**
 * GET /tournaments
 *
 * Params: {
 *  paidOnly: bool. Return paid teams only
 *  notFull: bool. Don't return full teams
 * }
 *
 * Response:
 * [
 *   [Tournament]
 * ]
 */
const List = (tournamentModel, teamModel, userModel) => {
    return async (req, res) => {
        try {
            let tournaments = await tournamentModel.findAll({
                include: [
                    {
                        model: teamModel,
                        include: {
                            model: userModel,
                            attributes: ['username', 'id'],
                        },
                    },
                ],
            });

            tournaments = await Promise.all(
                tournaments.map(async tournament => {
                    let teams = await Promise.all(
                        tournament.teams.map(async team => {
                            let isPaid = true;
                            let notFull = true;
                            if (req.query.paidOnly === 'true') {
                                isPaid = await isTeamPaid(
                                    req,
                                    team,
                                    null,
                                    tournament.playersPerTeam
                                );
                            }
                            if (req.query.notFull === 'true') {
                                notFull =
                                    team.users.length <
                                    tournament.playersPerTeam;
                            }
                            const formatUsers = team.users.map(
                                ({ username }) => username
                            );
                            return isPaid && notFull
                                ? { ...team.toJSON(), users: formatUsers }
                                : 'empty';
                        })
                    );
                    teams = teams.filter(team => team !== 'empty');
                    return {
                        ...tournament.toJSON(),
                        teams,
                    };
                })
            );

            return res
                .status(200)
                .json(tournaments)
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = List;
