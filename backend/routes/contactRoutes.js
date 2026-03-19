const express = require('express');
const router = express.Router();
const { submitContactForm, getInquiries, updateInquiryStatus } = require('../controllers/contactController');

// POST /api/contact - Submit contact form
router.post('/', submitContactForm);

// GET /api/contact - Get all contact form submissions (admin)
router.get('/', getInquiries);

// PUT /api/contact/:id/status - Update inquiry status (admin)
router.put('/:id/status', updateInquiryStatus);

module.exports = router;
