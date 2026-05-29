const nodemailer = require('nodemailer')
const dns = require('dns')
require('dotenv').config()

dns.setDefaultResultOrder('ipv4first')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS?.replace(/\s/g, ''),
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
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