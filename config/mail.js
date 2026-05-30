const Brevo = require('@getbrevo/brevo')
require('dotenv').config()

const client = Brevo.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY

const apiInstance = new Brevo.TransactionalEmailsApi()

const sendMail = async ({ to, subject, html }) => {
  try {
    const email = new Brevo.SendSmtpEmail()

    email.sender = {
      name: 'UOL Transport',
      email: 'haseeb.ahmed20035@gmail.com'
    }

    email.to = [{ email: to }]
    email.subject = subject
    email.htmlContent = html

    await apiInstance.sendTransacEmail(email)

    console.log('MAIL SENT TO:', to)
    return true
  } catch (err) {
    console.log('MAIL ERROR:', err?.response?.body || err.message)
    return false
  }
}

module.exports = { sendMail }