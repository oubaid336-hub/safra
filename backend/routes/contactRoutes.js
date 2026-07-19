const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { contactValidation } = require('../middleware/contactValidator');
const publicWriteLimiter = require('../middleware/publicWriteLimiter');

router.post('/', publicWriteLimiter, contactValidation, contactController.submitContactMessage);

module.exports = router;
