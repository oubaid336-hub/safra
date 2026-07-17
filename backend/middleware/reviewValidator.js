const { body } = require('express-validator');
const { handleValidationErrors } = require('./validatorsHelper');

const reviewCreateValidation = [
  body('listingId').trim().notEmpty().withMessage('listingId is required').isMongoId().withMessage('Invalid listingId'),
  body('listingType').trim().isIn(['house', 'car']).withMessage('listingType must be house or car'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }),
  handleValidationErrors
];

module.exports = { reviewCreateValidation };
