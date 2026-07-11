const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboardStats);

router.get('/houses', requireAuth, requireAdmin, adminController.getAllHousesAdmin);
router.put('/houses/:id/approve', requireAuth, requireAdmin, adminController.approveHouse);
router.put('/houses/:id/reject', requireAuth, requireAdmin, adminController.rejectHouse);

router.get('/cars', requireAuth, requireAdmin, adminController.getAllCarsAdmin);
router.put('/cars/:id/approve', requireAuth, requireAdmin, adminController.approveCar);
router.put('/cars/:id/reject', requireAuth, requireAdmin, adminController.rejectCar);

// ADMIN_MARKER_housescarsroutes
router.get('/bookings', requireAuth, requireAdmin, adminController.getAllBookingsAdmin);
router.put('/bookings/:id/confirm', requireAuth, requireAdmin, adminController.confirmBooking);
router.put('/bookings/:id/cancel', requireAuth, requireAdmin, adminController.cancelBooking);

// ADMIN_MARKER_bookingsroutes
router.get('/users', requireAuth, requireAdmin, adminController.getAllUsersAdmin);
router.put('/users/:id/block', requireAuth, requireAdmin, adminController.blockUser);
router.put('/users/:id/unblock', requireAuth, requireAdmin, adminController.unblockUser);
router.delete('/users/:id', requireAuth, requireAdmin, adminController.deleteUser);

// ADMIN_MARKER_usersroutes
router.get('/reviews', requireAuth, requireAdmin, adminController.getAllReviewsAdmin);
router.put('/reviews/:id/approve', requireAuth, requireAdmin, adminController.approveReview);
router.delete('/reviews/:id', requireAuth, requireAdmin, adminController.deleteReview);

// ADMIN_MARKER_reviewsroutes
router.post('/faq', requireAuth, requireAdmin, adminController.createFaqAdmin);
router.put('/faq/:id', requireAuth, requireAdmin, adminController.updateFaqAdmin);
router.delete('/faq/:id', requireAuth, requireAdmin, adminController.deleteFaqAdmin);

router.get('/contact-messages', requireAuth, requireAdmin, adminController.getAllContactMessagesAdmin);
router.delete('/contact-messages/:id', requireAuth, requireAdmin, adminController.deleteContactMessageAdmin);

// ADMIN_MARKER_part8routes
module.exports = router;
