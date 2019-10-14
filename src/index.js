const http = require('http')
const database = require('./database')
const socket = require('./socket')
const toornament = require('./toornament')
const Express = require('express')
const Api = require('./api/controllers')

module.exports = async () => {
    const { sequelize, models } = await database()

    const api = Api(models)

    //const server = http.Server(app);
    const io = socket(http, sequelize, models)

    // app.locals.app = app;
    // app.locals.server = server;
    // app.locals.db = sequelize;
    // app.locals.models = models;
    // app.locals.io = io;
    // app.locals.toornament = toornament;

    if (process.send) {
        process.send('ready')
    }

    return api
}
