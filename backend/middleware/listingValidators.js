const { body } = require('express-validator');
const { handleValidationErrors } = require('./validatorsHelper');

const houseCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 3000 }),
  body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 150 }),
  body('pricePerNight').isFloat({ min: 0 }).withMessage('Price per night must be a positive number'),
  body('rooms').optional().isInt({ min: 0 }).withMessage('Rooms must be a whole number'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a whole number'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  handleValidationErrors
];

const carCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 3000 }),
  body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 150 }),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('seats').optional().isInt({ min: 1 }).withMessage('Seats must be at least 1'),
  body('transmission').optional().isIn(['automatic', 'manual']).withMessage('Invalid transmission type'),
  body('fuelType').optional().isIn(['petrol', 'diesel', 'electric', 'hybrid']).withMessage('Invalid fuel type'),
  handleValidationErrors
];

module.exports = { houseCreateValidation, carCreateValidation };
