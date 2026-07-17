const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { carCreateValidation } = require('../middleware/listingValidators');

router.get('/', carController.getAll);
router.get('/:id', carController.getOne);
router.post('/', requireAuth, upload.array('photos', 10), carCreateValidation, carController.create);
router.put('/:id', requireAuth, carController.update);
router.delete('/:id', requireAuth, requireAdmin, carController.delete);

module.exports = router;


