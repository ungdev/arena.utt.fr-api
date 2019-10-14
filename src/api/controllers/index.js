/* eslint-disable global-require, import/no-dynamic-require */
const Auth = require('./auth/auth.js')

const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const error = require('../middlewares/error')

const Express = require('express')
const log = require('../utils/log')(module)

const mainRoutes = models => {
    const mainRouter = Express.Router()
    mainRouter.use('/auth', Auth(models))
    return mainRouter
}

module.exports = models => {
    const api = Express()
    api.use(
        morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
            stream: log.stream,
        })
    )

    api.use(helmet())
    api.use(cors())
    api.use(bodyParser.json())
    api.use(error.converter)
    api.use(error.notFound)
    api.use(error.handler)

    api.use('/api/v1', mainRoutes(models))
    return api
}
