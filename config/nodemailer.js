const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mkkashif745@gmail.com',
    pass: require('./keys').GOOGLE_PASS
  }
})

module.exports = transporter
