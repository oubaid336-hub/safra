const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { contactValidation } = require('../middleware/contactValidator');
const { contactValidation } = require('../middleware/contactValidator');

router.post('/', contactValidation, contactController.submitContactMessage);

module.exports = router;




