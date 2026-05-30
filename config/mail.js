require('dotenv').config()

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const sendMail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log('BREVO_API_KEY is missing in Railway variables')
      return false
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'UOL Transport',
          email:
            process.env.BREVO_SENDER_EMAIL || 'haseeb.ahmed20035@gmail.com',
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.log('BREVO MAIL ERROR:', data || response.statusText)
      return false
    }

    console.log('MAIL SENT TO:', to, data)
    return true
  } catch (err) {
    console.log('MAIL ERROR:', err.message)
    return false
  }
}

module.exports = { sendMail }