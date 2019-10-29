const Express = require('express');

const Scan = require('./scan.js');

const Entry = (models) => {
  const router = Express.Router();
  router.post('/scan', Scan(models.User, models.Team, models.Tournament, models.Cart, models.CartItem));
  return router;
};

module.exports = Entry;
