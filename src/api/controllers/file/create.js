const fileUploader = require('express-fileupload')
const fs = require('fs')
const uuidv4 = require('uuid/v4')

const handleFileSaving = async (file) => {
  return new Promise((resolve, reject) => {
    const fileId = uuidv4();
    file.mv('./uploads/' + fileId, (err) => {
      if (err) {
        reject(err);
      }
      resolve(fileId);
    });
  });
};


const uploadFile = async (request, response) => {
  try {
    const fileId = await handleFileSaving(request.files.file)
    return response.json({fileId: fileId}).status(200).end();
  } catch (err) {
    console.log(err.message)
    return response.json({message: 'something went wrong'}).status(500);
  }
};

module.exports = (app) => {
  app.use(fileUploader())
  app.post('/files', uploadFile);
};