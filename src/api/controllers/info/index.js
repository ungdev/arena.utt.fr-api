const Express = require('express');

const hasPermission = require('../../middlewares/hasPermission');
const List = require('./list.js');
const { Create, CheckCreate } = require('./create.js');

const Info = (models) => {
  const router = Express.Router();
  router.get('/', List(models.Info));
  router.post(
    '/',
    [hasPermission('anim'), CheckCreate],
    Create(models.Info),
  );
  return router;
};

module.exports = Info;