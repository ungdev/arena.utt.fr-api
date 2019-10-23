const Express = require('express');
const { Create, CheckCreate } = require('./create.js');
const List = require('./get.all.js');

const Network = models => {
    const router = Express.Router();
    router.post('/', CheckCreate, Create(models.Network));
    router.get('/', List(models.Network, models.User, models.Team));
    return router;
};
module.exports = Network;
