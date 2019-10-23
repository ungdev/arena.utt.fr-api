const Express = require('express');
const { Create, CheckCreate } = require('./create.js');
const List = require('./get.all.js');

const Network = models => {
    const router = Express.Router();
    router.post('/', CheckCreate, Create(models.Network));
    return router;
};
module.exports = Network;
