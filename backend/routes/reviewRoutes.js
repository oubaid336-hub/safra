const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { reviewCreateValidation } = require('../middleware/reviewValidator');

router.post('/', requireAuth, reviewCreateValidation, reviewController.createReview);
router.get('/summary/:listingType', reviewController.getRatingSummary);
router.get('/:listingType/:listingId', optionalAuth, reviewController.getReviewsForListing);

module.exports = router;
