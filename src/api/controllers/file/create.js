const fileUploader = require('express-fileupload')
const fs = require('fs')
const uuidv4 = require('uuid/v4')

const handleFileSaving = async (file) => {
  return new Promise((resolve, reject) => {
    file.mv('./uploads/' + uuidv4(), (err) => {
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
    return response.json({message: 'something went wrong'}).status(500);
  }
  return response.status(200).end();
};

module.exports = (app) => {
  app.use(fileUploader())
  app.post('/files', uploadFile);
};