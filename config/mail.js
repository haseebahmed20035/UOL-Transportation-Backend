const { Resend } = require('resend')
require('dotenv').config()

const resend = new Resend(process.env.RESEND_API_KEY)

const sendMail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'UOL Transport <onboarding@resend.dev>',
      to,
      subject,
      html
    })

    if (error) {
      console.log('MAIL ERROR:', error)
      return false
    }

    console.log('MAIL SENT TO:', to)
    return true
  } catch (err) {
    console.log('MAIL ERROR:', err.message)
    return false
  }
}

module.exports = { sendMail }