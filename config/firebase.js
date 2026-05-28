const admin = require('firebase-admin')

let firebaseApp = null

try {
  const serviceAccount = JSON.parse(
    Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64',
    ).toString('utf8'),
  )

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })

  console.log('✅ Firebase Admin initialized')
} catch (error) {
  console.log('❌ Firebase Admin init error:', error.message)
}

module.exports = admin