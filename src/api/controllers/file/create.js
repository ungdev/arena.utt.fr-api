const fileUploader = require('express-fileupload')
const fs = require('fs')
const uuidv4 = require('uuid/v4')

const handleFileSaving = async (file) => {
  return new Promise((resolve, reject) => {
    file.mv('./files/' + uuidv4(), (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};


const uploadFile = async (request, response) => {
  try {
    await handleFileSaving(request.files.file)
  } catch (err) {
    console.log(err.message)
    return response.json({message: 'something went wrong'});
  }
  return response.json({message: 'ok'});
};

module.exports = (app) => {
  app.use(fileUploader())
  app.post('/files', uploadFile);
};