const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

router.post('/', subscriberController.subscribe);
router.get('/unsubscribe/:token', subscriberController.unsubscribe);

module.exports = router;
