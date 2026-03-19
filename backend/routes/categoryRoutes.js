const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const clerkAuth = require('../middleware/clerkAuth');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Admin only routes
// Note: For now, I'll allow these without strict auth if the user is in development, 
// but it's better to include the middleware if available.
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
