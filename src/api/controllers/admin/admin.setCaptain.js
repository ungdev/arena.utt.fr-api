const isAdmin = require('../../middlewares/isAdmin')
const isAuth = require('../../middlewares/isAuth')
const errorHandler = require('../../utils/errorHandler')

/**
 * PUT /admin/setCaptain/:id (teamId) {
 *   userId
 * }
 *
 * Response: none
 *
 */

module.exports = app => {
  app.put('/admin/setCaptain/:id', [isAuth(), isAdmin()])

  app.put('/admin/setCaptain/:id', async (req, res) => {
    const { Team } = req.app.locals.models

    try {
      if (req.params.id === null || req.body.userId === null) {
        return res
          .status(400)
          .json({ error: 'BAD_REQUEST' })
          .end()
      }

      let team = await Team.find({
        where: { id: req.params.id }
      })

      team.captainId = req.body.userId
      await team.save()

      return res
        .status(200)
        .end()
    }
    catch (err) {
      errorHandler(err, res)
    }
  })
}