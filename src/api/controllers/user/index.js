const Express = require('express');

const { Edit, CheckEdit } = require('./edit.js');
const Get = require('./get.js');

const User = models => {
    const router = Express.Router();
    router.put('/:userId', CheckEdit, Edit(models.Cart, models.ItemModel));
    router.get(
        '/:userId',
        Get(models.User, models.Team, models.Cart, models.CartItem)
    );
    return router;
};

module.exports = User;
