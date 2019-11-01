const errorHandler = require('../../utils/errorHandler');

/**
 * GET /infos
 * {
 *
 * }
 * Response
 * {
 *   Infos
 * }
 * @param {object} infoModel model to query Infos
 */
const List = (infoModel) => async (request, response) => {
  try {
    const infos = await infoModel.findAll();

    return response
      .status(200)
      .json(infos)
      .end();
  }
  catch (error) {
    return errorHandler(error, response);
  }
};

module.exports = List;
