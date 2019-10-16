/* eslint-disable global-require, import/no-dynamic-require */

const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const Express = require('express');
const error = require('../middlewares/error');
const isAuth = require('../middlewares/isAuth.js');
const log = require('../utils/log')(module);

const Auth = require('./auth');
const Cart = require('./cart');
const User = require('./user');

const mainRoutes = models => {
    const mainRouter = Express.Router();
    mainRouter.use('/auth', Auth(models));
    mainRouter.use('/carts', [isAuth()], Cart(models));
    mainRouter.use('/users', [isAuth()], User(models));
    return mainRouter;
};

module.exports = models => {
    const api = Express();
    api.use(
        morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
            stream: log.stream,
        })
    );

    api.use(helmet());
    api.use(cors());
    api.use(bodyParser.json());

    api.use('/api/v1', mainRoutes(models));

    api.use(error.converter);
    api.use(error.notFound);
    api.use(error.handler);

    return api;
};
