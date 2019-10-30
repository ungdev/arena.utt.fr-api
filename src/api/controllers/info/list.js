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
const List = (infoModel) => async (req, res) => {
  try {
    const infos = await infoModel.findAll();

    return res
      .status(200)
      .json(infos)
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = List;
