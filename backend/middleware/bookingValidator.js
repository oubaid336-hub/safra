const { body } = require('express-validator');
const { handleValidationErrors } = require('./validatorsHelper');

const bookingCreateValidation = [
  body('listingId').trim().notEmpty().withMessage('listingId is required').isMongoId().withMessage('Invalid listingId'),
  body('listingType').trim().isIn(['house', 'car']).withMessage('listingType must be house or car'),
  body('startDate').notEmpty().withMessage('startDate is required').isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').notEmpty().withMessage('endDate is required').isISO8601().withMessage('endDate must be a valid date'),
  handleValidationErrors
];

module.exports = { bookingCreateValidation };
