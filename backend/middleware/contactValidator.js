const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validatorsHelper');

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  handleValidationErrors
];

module.exports = { contactValidation };
