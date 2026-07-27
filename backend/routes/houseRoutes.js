const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { houseCreateValidation } = require('../middleware/listingValidators');

router.get('/', houseController.getAll);
router.get('/:id', optionalAuth, houseController.getOne);
router.post('/', requireAuth, upload.array('photos', 10), houseCreateValidation, houseController.create);
router.put('/:id', requireAuth, houseController.update);
router.delete('/:id', requireAuth, requireAdmin, houseController.delete);

module.exports = router;



