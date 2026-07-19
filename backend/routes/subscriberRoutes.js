const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const { subscribeValidation } = require('../middleware/subscriberValidator');
const publicWriteLimiter = require('../middleware/publicWriteLimiter');

router.post('/', publicWriteLimiter, subscribeValidation, subscriberController.subscribe);
router.get('/unsubscribe/:token', subscriberController.unsubscribe);

module.exports = router;
