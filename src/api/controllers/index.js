/* eslint-disable global-require, import/no-dynamic-require */

const Express = require('express');
const isAuth = require('../middlewares/isAuth.js');

const Auth = require('./auth');
const Cart = require('./cart');
const User = require('./user');
const Tournament = require('./tournament');
const Team = require('./team');
const Item = require('./items');

const MainRoutes = models => {
    const mainRouter = Express.Router();
    mainRouter.use('/auth', Auth(models));
    mainRouter.use('/users', User(models));
    mainRouter.use('/tournaments', [isAuth()], Tournament(models));
    mainRouter.use('/carts', [isAuth()], Cart(models));
    mainRouter.use('/teams', [isAuth()], Team(models));
    mainRouter.use('/items', [isAuth()], Item(models));
    mainRouter.use('/carditems');
    return mainRouter;
};

module.exports = MainRoutes;
