const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');
const { bookingCreateValidation } = require('../middleware/bookingValidator');

router.post('/', requireAuth, bookingCreateValidation, bookingController.create);
router.get('/mine', requireAuth, bookingController.getMine);

module.exports = router;


