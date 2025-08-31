const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const clerkAuth = require('../middleware/clerkAuth');

// Get current user profile (requires authentication)
router.get('/profile', clerkAuth, userController.getCurrentUser);

// Get user by Clerk ID
router.get('/clerk/:clerkUserId', userController.getUserByClerkId);

// Create or update user from Clerk webhook
router.post('/webhook', userController.createOrUpdateUser);

// Delete user when deleted from Clerk
router.delete('/webhook', userController.deleteUser);

module.exports = router;
