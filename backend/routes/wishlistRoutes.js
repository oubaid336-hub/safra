const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validatorsHelper');

router.post('/:listingId', requireAuth, param('listingId').isMongoId().withMessage('Invalid listingId'), handleValidationErrors, wishlistController.toggle);
router.get('/', requireAuth, wishlistController.getMine);

module.exports = router;
