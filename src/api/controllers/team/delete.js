const isAuth = require('../../middlewares/isAuth');
const errorHandler = require('../../utils/errorHandler');
const isCaptain = require('../../middlewares/isCaptain');
const isType = require('../../middlewares/isType');

/**
 * DELETE /teams/:id
 *
 * Response:
 */
const Delete = (teamIdString, teamModel) => {
    return async (req, res) => {
        const teamId = req.params[teamIdString] || -1;
        console.log(teamId);
        if (teamId == -1) {
            return res.json({ message: 'no team id given.' }).end(400);
        }
        try {
            req.user.type = 'none';
            await req.user.save();
            await req.user.team.destroy();
            return res.status(204).end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = Delete;
