const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const clerkAuth = require('../middleware/clerkAuth');

// Create new order
router.post('/create', orderController.createOrder);

// Get all orders (admin)
router.get('/all', orderController.getAllOrders);

// Get current user's orders
router.get('/my-orders', clerkAuth, orderController.getMyOrders);

// Get user's orders (by ID)
router.get('/:userId', orderController.getUserOrders);

// Process payment
router.post('/process-payment', orderController.processPayment);

// Get payment methods
router.get('/payment-methods', orderController.getPaymentMethods);

// Get single order
router.get('/order/:id', orderController.getOrderById);

// Update order status (admin only)
router.put('/:id/status', orderController.updateOrderStatus);

// Razorpay webhook
router.post('/webhook', orderController.razorpayWebhook);

module.exports = router;
