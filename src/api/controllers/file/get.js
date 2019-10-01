const fs = require('fs');
const log = require('../../utils/log')(module)

const serveFile = async (request, response) => {
  try {
    const fileContent = fs.promises.readFile('./uploads/' + request.params.id);
    response.status(200).end(await fileContent);
  } catch (err) {
    log.error(err.message)
    response.status(500).end()
  }
};

module.exports = (app) => {
  app.get('/files/:id', serveFile)
}
