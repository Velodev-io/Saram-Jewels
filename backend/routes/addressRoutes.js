const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const clerkAuth = require('../middleware/clerkAuth');

// All address routes require authentication
router.use(clerkAuth);

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/set-default', addressController.setDefaultAddress);

module.exports = router;
