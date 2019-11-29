const Express = require('express');
const isAuth = require('../middlewares/isAuth');
const resttrictToIp = require('../middlewares/restrictToIP');
const hasPermission = require('../middlewares/hasPermission');

const Admin = require('./admin');
const Auth = require('./auth');
const Cart = require('./cart');
const Entry = require('./entry');
const Info = require('./info');
const Network = require('./network');
const File = require('./files');
const Item = require('./items');
const Team = require('./team');
const Tournament = require('./tournament');
const User = require('./user');

const MainRoutes = (models) => {
  const mainRouter = Express.Router();

  mainRouter.use('/admin', isAuth(), Admin(models));
  mainRouter.use('/auth', Auth(models));
  mainRouter.use('/users', isAuth(), User(models));
  mainRouter.use('/tournaments', isAuth(), Tournament(models));
  mainRouter.use('/carts', Cart(models));
  mainRouter.use('/teams', isAuth(), Team(models));
  mainRouter.use('/items', isAuth(), Item(models));
  mainRouter.use('/entry', isAuth(), hasPermission('entry'), Entry(models));
  mainRouter.use('/infos', isAuth(), Info(models));
  mainRouter.use('/files', File());
  mainRouter.use(
    '/network',
    resttrictToIp(['::1', 'awdawdawd']),
    Network(models)
  );
  mainRouter.use('/admin', isAuth(), Admin(models));
  return mainRouter;
};

module.exports = MainRoutes;
