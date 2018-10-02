const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const env = require('../../env')
const log = require('../utils/log')(module)

jwt.verify = promisify(jwt.verify)

module.exports = route => async (req, res, next) => {
  const { User, Team, Spotlight } = req.app.locals.models

  const auth = req.get('X-Token')

  if (!auth || auth.length === 0) {
    log.warn('missing token', { route })

    return res
      .status(401)
      .json({ error: 'NO_TOKEN' })
      .end()
  }

  try {
    const decoded = await jwt.verify(auth, env.ARENA_API_SECRET)

    const user = await User.findById(decoded.id, {
      include: [
        {
          model: Team,
          include: [User, Spotlight]
        }
      ]
    })

    req.user = user
    log.info(req.user)
    if(req.user.isAdmin == 100) next()
    else return res
      .status(401)
      .json({ error: 'NOT_ADMIN' })
      .end()
  } catch (err) {
    log.warn('invalid token', { route })

    return res
      .status(401)
      .json({ error: 'INVALID_TOKEN' })
      .end()
  }
}