/* eslint-disable global-require, import/no-dynamic-require */
const Auth = require('./auth/auth.js')

const Express = require('express');
const fs = require('fs');
const path = require('path');
const log = require('../utils/log')(module);

const mainRoutes = (models) => {
  const mainRouter = Express.Router()
  mainRouter.use('/auth', Auth(models))
  return mainRouter
}

module.exports = (models) => {
  const api = Express()
  api.use('/api/v1', mainRoutes(models))
  return api
};
