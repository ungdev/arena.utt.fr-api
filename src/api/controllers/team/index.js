const Express = require('express');

const isNotInTeam = require('../../middlewares/isNotInTeam.js');
const isCaptain = require('../../middlewares/isCaptain.js');
const isType = require('../../middlewares/isType.js');

const { Create, CheckCreate } = require('./create.js');
const Delete = require('./delete.js');
const { AddUser, CheckAddUser } = require('./addUsers.js');

const teamId = 'teamId';

const Team = models => {
    const router = Express.Router();
    router.post(
        '/',
        [isNotInTeam(), CheckCreate],
        Create(models.Tournament, models.Team, models.User)
    );
    router.delete(
        `/:${teamId}`,
        [isCaptain(teamId), isType('player')],
        Delete(teamId, models.Team)
    );
    router.post(
        `/:${teamId}`,
        [isCaptain(teamId), isType('player'), CheckAddUser],
        AddUser(teamId, models.User, models.Team, models.Tournament)
    );
    return router;
};
module.exports = Team;
