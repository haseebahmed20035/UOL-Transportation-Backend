const nodemailer = require('nodemailer')
require('dotenv').config()

const mailUser = process.env.MAIL_USER
const mailPass = process.env.MAIL_PASS?.replace(/\s/g, '')

if (!mailUser || !mailPass) {
  console.log('MAIL ENV MISSING:', {
    MAIL_USER: mailUser ? 'FOUND' : 'MISSING',
    MAIL_PASS: mailPass ? 'FOUND' : 'MISSING',
  })
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: mailUser,
    pass: mailPass,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
})

transporter.verify(error => {
  if (error) {
    console.log('MAIL CONFIG ERROR:', {
      message: error.message,
      code: error.code,
      command: error.command,
    })
  } else {
    console.log('MAIL SERVER READY')
  }
})

module.exports = transporter