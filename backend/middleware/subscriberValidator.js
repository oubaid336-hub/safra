const { body } = require('express-validator');
const { handleValidationErrors } = require('./validatorsHelper');

const subscribeValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors
];

module.exports = { subscribeValidation };
