const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');
const { reviewCreateValidation } = require('../middleware/reviewValidator');

router.post('/', requireAuth, reviewCreateValidation, reviewController.createReview);
router.get('/:listingType/:listingId', reviewController.getReviewsForListing);

module.exports = router;


