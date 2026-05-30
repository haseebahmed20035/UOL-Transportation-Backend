require('dotenv').config()

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const sendMail = async ({ to, subject, html }) => {
  try {
    const brevoKey = (process.env.BREVO_API_KEY || '').trim()

    if (!brevoKey) {
      console.log('BREVO_API_KEY is missing in Railway variables')
      return false
    }

    console.log('BREVO KEY CHECK:', {
      startsWithXkeysib: brevoKey.startsWith('xkeysib-'),
      length: brevoKey.length,
    })

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'UOL Transportation System',
          email:
            process.env.BREVO_SENDER_EMAIL || 'haseeb.ahmed20035@gmail.com',
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    const responseText = await response.text()

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }

    console.log('BREVO STATUS:', response.status)
    console.log('BREVO RESPONSE:', data)

    if (!response.ok) {
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