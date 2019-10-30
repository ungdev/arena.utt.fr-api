const Express = require('express');

const hasPermission = require('../../middlewares/hasPermission');
const List = require('./list.js');

const Admin = (models) => {
  const router = Express.Router();
  router.get('/users', [hasPermission('anim')], List(models.User, models.Team, models.Tournament, models.Cart, models.CartItem));
  return router;
};

module.exports = Admin;