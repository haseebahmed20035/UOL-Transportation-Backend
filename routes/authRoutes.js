const express = require('express');
const router = express.Router();

// ✅ IMPORT googleLogin ALSO
const { loginUser, registerAdmin, googleLogin } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register', registerAdmin);

// ✅ FIXED
router.post("/google-login", googleLogin);

module.exports = router;