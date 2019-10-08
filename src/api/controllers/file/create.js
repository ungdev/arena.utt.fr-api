const fileUploader = require('express-fileupload')
const fs = require('fs')
const uuidv4 = require('uuid/v4')
const log = require('../../utils/log')(module)
const isAuth = require('../../middlewares/isAuth')
const path = require('path')

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/'

const handleFileSaving = async (file) => {
  return new Promise((resolve, reject) => {
    const fileId = uuidv4();
    const filePath = path.join(UPLOAD_DIR, fileId)
    file.mv(filePath, (err) => {
      if (err) {
        reject(err);
      }
      resolve(fileId);
    });
  });
};

const requestHasFile = request => request.files !== undefined && request.files.file !== undefined

const fileHasAcceptableSize = request => {
  const mega = 1000000
  console.log(request.files.file.size)
  if (requestHasFile(request)) {
    const file = request.files.file
    if (file.size < 5 * mega) {
      return true
    }
  }
  return false;
}

const uploadFile = async (request, response) => {
  if (!requestHasFile(request)) {
    return response.json({message: 'No file provided'}).status(400).end()
  }
  if (!fileHasAcceptableSize(request)) {
    return response.json({message: 'File is too heavy'}).status(400).end()
  }
  try {
    const fileId = await handleFileSaving(request.files.file)
    return response.json({fileId: fileId}).status(200).end();
  } catch (err) {
    log.error(err.message);
    return response.json({message: 'something went wrong'}).status(500);
  }
};

module.exports = (app) => {
  app.use(fileUploader())
  app.post('/files', [isAuth()], uploadFile);
};