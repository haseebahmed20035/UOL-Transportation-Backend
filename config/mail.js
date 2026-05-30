const SibApiV3Sdk = require('@getbrevo/brevo')
require('dotenv').config()

let defaultClient = SibApiV3Sdk.ApiClient.instance
let apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

const sendMail = async ({ to, subject, html }) => {
  try {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail.sender = {
      name: 'UOL Transport',
      email: 'haseeb.ahmed20035@gmail.com'
    }

    sendSmtpEmail.to = [{ email: to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = html

    await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log('MAIL SENT TO:', to)
    return true
  } catch (err) {
    console.log('MAIL ERROR:', err?.response?.body || err.message)
    return false
  }
}

module.exports = { sendMail }