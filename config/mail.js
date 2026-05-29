const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS?.replace(/\s/g, ''),
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.log('MAIL CONFIG ERROR:', error.message)
  } else {
    console.log('MAIL SERVER READY')
  }
})

module.exports = transporter