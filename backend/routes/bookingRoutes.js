const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');
const { bookingCreateValidation } = require('../middleware/bookingValidator');
const publicWriteLimiter = require('../middleware/publicWriteLimiter');

router.post('/', requireAuth, publicWriteLimiter, bookingCreateValidation, bookingController.create);
router.get('/availability', bookingController.getAvailability);
router.get('/counts/:listingType', bookingController.getBookingCounts);
router.get('/mine', requireAuth, bookingController.getMine);
router.get('/:id', requireAuth, bookingController.getOne);
router.patch('/:id/confirm-cash', requireAuth, bookingController.confirmCash);
router.patch('/:id/cancel', requireAuth, bookingController.cancel);

module.exports = router;
