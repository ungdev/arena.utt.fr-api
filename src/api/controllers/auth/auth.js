const Express = require('express')
const Login = require('./login.js')
const { check } = require('express-validator');
const validateBody = require('../../middlewares/validateBody')

const Auth = (models) => {
  router = Express.Router()
  router.post('/login',[
    check('username')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ \-]+/i),
    check('password')
      .exists(),
    validateBody(),

  ], Login(models))
  return router
}

module.exports = Auth