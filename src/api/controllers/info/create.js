const { check } = require('express-validator');
const axios = require('axios');
const validateBody = require('../../middlewares/validateBody');
const errorHandler = require('../../utils/errorHandler');

const CheckCreate = [
  check('title').isString(),
  check('content').isString(),
  check('tournamentId').optional(),
  validateBody(),
];

/**
 * POST /infos
 * {
 *    title: String
 *    content: String
 *    tournamentId: Int
 * }
 * Response
 * {
 *   Info
 * }
 * @param {object} infoModel model to query Infos
 */
const Create = (infoModel) => async (request, response) => {
  try {
    const info = await infoModel.create({
      ...request.body,
      userId: request.user.id,
    });

    axios.post('https://onesignal.com/api/v1/notifications', {
      contents: {
        "fr": request.body.content
      },
      headings: {
        "fr": request.body.title
      }
    }, {
      params: {
        app_id: "4483353a-c200-40a6-9a59-1db5fd155363",
        included_segments: ["Active Users"],
        filters: [{ field: 'tag', key: 'tournamentId', relation: '=', value: request.body.tournamentId }]
      }
    })

    return response
      .status(201)
      .json({
        ...info.toJSON(),
        user: { firstname: request.user.firstname, lastname: request.user.lastname },
      })
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = { Create, CheckCreate };
