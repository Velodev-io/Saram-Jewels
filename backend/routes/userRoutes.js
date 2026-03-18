const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const clerkAuth = require('../middleware/clerkAuth');

// Get current user profile (requires authentication)
router.get('/profile', clerkAuth, userController.getCurrentUser);

// Update current user profile (requires authentication)
router.put('/profile', clerkAuth, userController.updateCurrentUser);

// Get all users (admin)
router.get('/all', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserProfile);

// Get user by Clerk ID
router.get('/clerk/:clerkUserId', userController.getUserByClerkId);

// Create or update user from Clerk webhook
router.post('/webhook', userController.createOrUpdateUser);

// Delete user when deleted from Clerk
router.delete('/webhook', userController.deleteUser);

module.exports = router;
