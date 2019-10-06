/* eslint-disable no-async-promise-executor */
const bwipjs = require('bwip-js');
const fs = require('fs');

const isAuth = require('../middlewares/isAuth');
const log = require('../utils/log')(module);

const PDFDocument = require('pdfkit');
const path = require('path');
const fond = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, '../utils', 'assets', 'billet-ua.png'), 'base64')}`;


function generateBarcode(user) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'ean13',
      text: user.barcode,
      includetext: true,
      height: 10,
      rotate: 'L',
    }, (err, png) => {
      if (err) {
        log.info(err);
        reject(err);
      }
      resolve(png);
    });
  });
}

function generatePdf(user) {
  return new Promise( async (resolve) => {
    const doc = new PDFDocument({ size: [841.89, 595.28] });

    doc.image(fond, 0, 0, { width: doc.page.width, height: doc.page.height });

    doc
      .font(path.join(__dirname, '../utils', 'assets', 'montserrat.ttf'))
      .fontSize(30)
      .fillColor('white')
      .text(`${user.lastname} ${user.firstname}\nblablab`, 400, 50);

    const barecode = await generateBarcode(user);

    doc.image(barecode, 775, 30, { width: 49 });

    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.end();
  });
}

module.exports = (app) => {
  app.get('/test', isAuth());
  app.get('/test', async (req, res) => {

    const c = await generatePdf(req.user);

    const wstream = fs.createWriteStream('./test.pdf');
    wstream.write(c);
    wstream.end();

    return res
      .status(200)
      .end();
  });
};

