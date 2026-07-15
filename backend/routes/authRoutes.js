const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, login, verifyEmail, forgotPassword, resetPassword, me, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, try again later' }
});

router.post('/signup', loginLimiter, signup);
router.post('/login', loginLimiter, login);
router.get('/verify/:token', verifyEmail); // ADMIN_MARKER_verifyroute
router.post('/forgot-password', loginLimiter, forgotPassword); // ADMIN_MARKER_resetroutes
router.post('/reset-password/:token', resetPassword);

router.get('/me', requireAuth, me);
router.post('/logout', logout);

module.exports = router;
