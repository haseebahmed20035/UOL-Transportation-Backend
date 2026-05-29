const nodemailer = require('nodemailer')
const dns = require('dns')
require('dotenv').config()

// Force Node.js to prefer IPv4 instead of IPv6
dns.setDefaultResultOrder('ipv4first')

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
  family: 4, // force IPv4
  auth: {
    user: mailUser,
    pass: mailPass,
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