const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, login, verifyEmail, forgotPassword, resetPassword, me, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { signupValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../middleware/validators');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, try again later' }
});

router.post('/signup', loginLimiter, signupValidation, signup);
router.post('/login', loginLimiter, loginValidation, login);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', loginLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', loginLimiter, resetPasswordValidation, resetPassword);

router.get('/me', requireAuth, me);
router.post('/logout', logout);

module.exports = router;
