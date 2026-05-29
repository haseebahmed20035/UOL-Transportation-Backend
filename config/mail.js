const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  family: 4, // force IPv4, avoids ENETUNREACH IPv6 issue

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS?.replace(/\s/g, ''),
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  tls: {
    rejectUnauthorized: false,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.log('MAIL CONFIG ERROR:', error)
  } else {
    console.log('MAIL SERVER READY')
  }
})

module.exports = transporter