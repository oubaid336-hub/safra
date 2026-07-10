const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');

router.post('/:listingId', requireAuth, wishlistController.toggle);
router.get('/', requireAuth, wishlistController.getMine);

module.exports = router;
