const errorHandler = require('../../utils/errorHandler');

/**
 * DELETE /infos/:id
 * {
 *
 * }
 * Response
 * {
 *
 * }
 * @param {string} infoIdString
 * @param {object} infoModel model to query Infos
 */
const Delete = (infoIdString, infoModel) => async (req, res) => {
  try {
    const id = req.params[infoIdString];
    await infoModel.destroy({
      where: { id },
    });

    return res
      .status(200)
      .end();
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = Delete;
