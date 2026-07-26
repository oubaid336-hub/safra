const express = require('express');
const router = express.Router();
const adminBookingController = require('../controllers/adminBookingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, requireAdmin, adminBookingController.getAll);
router.put('/:id/confirm', requireAuth, requireAdmin, adminBookingController.confirm);
router.put('/:id/cancel', requireAuth, requireAdmin, adminBookingController.cancel);

module.exports = router;
