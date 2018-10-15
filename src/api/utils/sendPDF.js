const fs = require('fs')
const path = require('path')
const log = require('./log')(module)
const env = require('../../env')

const PDFDocument = require('pdfkit')
const bwipjs = require('bwip-js')
const transporter = require('nodemailer').createTransport(env.ARENA_MAIL_SMTP)


let fond = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'billet-ua.png'), 'base64')}`
const mailMessage = `Vous avez acheté votre place pour l'UTT Arena 2018
Vous trouverez la place en format numérique en pièce jointe. Veuillez conserver la place : elle sera nécessaire pour entrer à l'UTT Arena.
À bientôt pour l'UTT Arena !
Toute l'équipe organisatrice`

const htmlMessage = fs.readFileSync(path.join(__dirname, 'template.html'))

function generateBarcode(user) {
  log.info('USER BARCODE', user.barcode)
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'ean13',
      text: user.barcode,
      height: 10,
      includetext: false
    }, function (err, png) {
      if (err) {
        log.info(err)
        reject(err)
      }

      resolve(png)
    })
  })
}

function generatePdf(user, barcode) {
  return new Promise((resolve, reject) => {

    const doc = new PDFDocument()

    doc.image(fond, 0, 0, { width: doc.page.width, height: doc.page.height })
    let scoup = ''
    if(user.kaliento) scoup = `${scoup}, kaliento`
    if(user.mouse) scoup = `${scoup}, souris`
    if(user.keyboard) scoup = `${scoup}, clavier`
    if(user.headset) scoup = `${scoup}, casque`
    if(user.chair) scoup = `${scoup}, chaise gaming`
    if(user.screen24) scoup = `${scoup}, écran 24"`
    if(user.screen27) scoup = `${scoup}, écran 27"`
    if(user.laptop) scoup = `${scoup}, PC portable`
    if(user.gamingPC) scoup = `${scoup}, PC gaming`
    if(user.streamingPC) scoup = `${scoup}, PC streaming`
    if(scoup.length > 0) scoup = scoup.substr(2, scoup.length)
    if(user.shirt === 'none') user.shirt = 'aucun'
    else {
      const gen = user.shirt.substr(0, 1) === 'h' ? 'Homme' : 'Femme'
      const size = user.shirt.substr(1, user.shirt.length).toUpperCase()
      user.shirt = `${gen} ${size}`
    }
    doc
        .font(__dirname + '/assets/ua-2018.ttf')
        .fontSize(30)
        .text(`${user.lastname} ${user.firstname}`, 204, 240)
        .text(`${user.plusone ? 'Accompagnateur' : 'Joueur'}`, 120, 276)
        .text(`${user.shirt}`, 140, 312)
        .text(`${user.ethernet ? 'oui': 'non'}`, 165, 349)
        .text(`${user.ethernet7 ? 'oui': 'non'}`, 165, 386)
        .text(`${user.tombola}`, 153, 421)
        .text(`${scoup}`, 158, 457)

    //doc.image(barcode, 215, 500)

    const buffers = []

    doc.on('data', chunk => buffers.push(chunk))

    doc.on('end', () => resolve(Buffer.concat(buffers)))

    doc.end()
  })
}

module.exports = async (user) => {
  //const barcode = await generateBarcode(user)
  const barcode = 01234
  log.info('before generation')
  const pdf = await generatePdf(user, barcode)
  
  log.info(`[generatePdf] sending mail to ${user.email}`)

  return transporter.sendMail({
      from: '"UTT Arena" <arena@utt.fr>',
      to: user.email,
      subject: 'Place UTT Arena 2018',
      text: mailMessage,
      html: htmlMessage,
      attachments: [
          { filename: `UTT.Arena.2018.pdf`, content: pdf }
      ]
  })
}