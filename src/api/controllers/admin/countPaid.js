const isAdmin = require('../../middlewares/isAdmin')
const errorHandler = require('../../utils/errorHandler')
const isAuth = require('../../middlewares/isAuth')
const { isTeamFull } = require('../../utils/isFull')

/**
 * GET /users
 *
 * Response:
 * [
 *    
 * ]
 */
module.exports = app => {
  app.get('/admin/paids', [isAuth(), isAdmin()])

  app.get('/admin/paids', async (req, res) => {
    const { User, Team, Spotlight } = req.app.locals.models

    try {
      let totalPlayers = await User.count()
      let totalPaidVisitors = await User.count({
          where:{ paid: 1, plusone: 1}
      })
      let totalPaidPlayers = await User.count({
          where: { paid: 1, plusone: 0}
      })
      let totalUnpaid = await User.count({
          where: { paid: 0}
      })
      let totalTeams = await Team.count()
      const teams = await Team.findAll({ include: [Spotlight, User] })
      const totalPaidTeams = teams.filter(team => isTeamFull(team, team.spotlight.perTeam, true)).length
      const totalFullTeams = teams.filter(team => isTeamFull(team, team.spotlight.perTeam, false)).length
      return res
        .status(200)
        .json({ totalPlayers, totalPaidPlayers, totalPaidVisitors, totalUnpaid, totalTeams, totalPaidTeams, totalFullTeams })
        .end()
    } catch (err) {
      errorHandler(err, res)
    }
  })
}
