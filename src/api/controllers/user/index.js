const Express = require('express');

const { Edit, CheckEdit } = require('./edit.js');
const Get = require('./get.js');

const User = models => {
    const router = Express.Router();
    router.put('/:userId', CheckEdit, Edit());
    router.get('/:userId', Get(models.User, models.Team));
    return router;
};

module.exports = User;
