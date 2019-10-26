const errorHandler = require('../../utils/errorHandler');

/**
 * GET /tournaments/:id
 *
 * Params: {
 *  onlyPaid: true Display only full team paid
 * }
 *
 * Response:
 * [Tournament]
 */

const Get = (tournamentModel, teamModel, userModel) => {
    return async (req, res) => {
        try {
            const tournament = await tournamentModel.findByPk(
                req.params.tournamentId,
                {
                    include: [
                        {
                            model: teamModel,
                            include: [
                                {
                                    model: userModel,
                                    attributes: ['id'],
                                },
                            ],
                        },
                    ],
                }
            );
            let teams = await Promise.all(
                tournament.teams.map(async team => {
                    let isPaid = true;
                    if (req.query.paidOnly === 'true') {
                        isPaid = await isTeamPaid(
                            req,
                            team,
                            null,
                            tournament.playersPerTeam
                        );
                    }
                    return isPaid
                        ? {
                              ...team.toJSON(),
                              users: undefined,
                          }
                        : 'empty';
                })
            );
            teams = teams.filter(team => team !== 'empty');
            return res
                .status(200)
                .json({
                    ...tournament.toJSON(),
                    teams,
                })
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = Get;
