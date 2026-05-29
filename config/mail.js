const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: '142.250.102.109', // smtp.gmail.com IPv4
  port: 587,
  secure: false,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS?.replace(/\s/g, ''),
  },

  tls: {
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false,
  },

  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
})

transporter.verify((error) => {
  if (error) {
    console.log('MAIL CONFIG ERROR:', error)
  } else {
    console.log('MAIL SERVER READY')
  }
})

module.exports = transporter