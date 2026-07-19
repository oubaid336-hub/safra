const rateLimit = require('express-rate-limit');

const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests, try again later' }
});

module.exports = publicWriteLimiter;
