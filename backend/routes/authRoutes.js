const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, login, verifyEmail, resendVerification, forgotPassword, resetPassword, me, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { signupValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../middleware/validators');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, try again later' }
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many requests, try again later' }
});

router.post('/signup', loginLimiter, signupValidation, signup);
router.post('/login', loginLimiter, loginValidation, login);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', recoveryLimiter, forgotPasswordValidation, resendVerification);
router.post('/forgot-password', recoveryLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', recoveryLimiter, resetPasswordValidation, resetPassword);

router.get('/me', requireAuth, me);
router.post('/logout', logout);

module.exports = router;

