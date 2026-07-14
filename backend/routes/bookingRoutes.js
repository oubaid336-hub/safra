const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, bookingController.create);
router.get('/mine', requireAuth, bookingController.getMine);

module.exports = router;
