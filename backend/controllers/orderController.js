const { Order, OrderItem, Cart, Product, User } = require('../models');
const Razorpay = require('razorpay');
const sequelize = require('../config/database');

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.log('⚠️ Razorpay credentials not configured. Payment functionality will be limited.');
}

// Create new order
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { user_id, shipping_address, payment_method = 'razorpay' } = req.body;
    
    // Get user's cart items
    const cartItems = await Cart.findAll({
      where: { user_id },
      include: [{ model: Product, as: 'product' }],
      transaction
    });
    
    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total amount
    let total_amount = 0;
    cartItems.forEach(item => {
      total_amount += parseFloat(item.product.price) * item.quantity;
    });
    
    let razorpayOrder = null;
    
    // Create Razorpay order only if using Razorpay and Razorpay is configured
    if (payment_method === 'razorpay' && razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total_amount * 100), // Convert to paisa
        currency: 'INR',
        receipt: `order_${Date.now()}`
      });
    } else if (payment_method === 'razorpay' && !razorpay) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    
    // Create order in database
    const order = await Order.create({
      user_id,
      total_amount,
      status: 'pending',
      razorpay_order_id: razorpayOrder?.id || null,
      payment_method: payment_method,
      shipping_address
    }, { transaction });
    
    // Create order items
    const orderItems = await Promise.all(cartItems.map(async (item) => {
      return OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price
      }, { transaction });
    }));
    
    // Clear user's cart
    await Cart.destroy({
      where: { user_id },
      transaction
    });
    
    await transaction.commit();
    
    res.status(201).json({
      order,
      orderItems,
      razorpayOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Process payment for different methods
exports.processPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { order_id, payment_method, payment_details } = req.body;
    
    const order = await Order.findByPk(order_id, { transaction });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    let payment_id = null;
    let payment_status = 'pending';
    
    switch (payment_method) {
      case 'razorpay':
        // Verify Razorpay payment
        if (!razorpay) {
          throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
        }
        try {
          const payment = await razorpay.payments.fetch(payment_details.payment_id);
          if (payment.status === 'captured') {
            payment_status = 'completed';
            payment_id = payment.id;
          } else {
            payment_status = 'failed';
          }
        } catch (error) {
          console.error('Razorpay payment verification failed:', error);
          payment_status = 'failed';
        }
        break;
        
      case 'upi':
        // Simulate UPI payment verification
        payment_status = 'completed';
        payment_id = `upi_${Date.now()}`;
        break;
        
      case 'card':
        // Simulate card payment verification
        payment_status = 'completed';
        payment_id = `card_${Date.now()}`;
        break;
        
      default:
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    // Update order status
    const orderStatus = payment_status === 'completed' ? 'processing' : 'cancelled';
    await order.update({
      status: orderStatus,
      payment_id: payment_id,
      payment_status: payment_status
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      success: payment_status === 'completed',
      order: order,
      payment_id: payment_id,
      status: payment_status
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: User, as: 'user' }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await order.update({ status });
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Razorpay webhook handler
exports.razorpayWebhook = async (req, res) => {
  try {
    const { payload } = req.body;
    const { payment } = payload;
    
    // Verify webhook signature (implement in production)
    // const signature = req.headers['x-razorpay-signature'];
    // const isValid = razorpay.webhooks.verify(JSON.stringify(req.body), signature, webhook_secret);
    
    if (payment && payment.entity && payment.entity.order_id) {
      const order = await Order.findOne({
        where: { razorpay_order_id: payment.entity.order_id }
      });
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Update order status based on payment status
      if (payment.entity.status === 'captured') {
        await order.update({
          status: 'processing',
          payment_id: payment.entity.id,
          payment_status: 'completed'
        });
      } else if (payment.entity.status === 'failed') {
        await order.update({ 
          status: 'cancelled',
          payment_status: 'failed'
        });
      }
      
      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      res.status(400).json({ message: 'Invalid webhook payload' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Pay with UPI, Cards, Net Banking',
        icon: 'banknotes',
        color: 'blue'
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI ID',
        icon: 'device-phone-mobile',
        color: 'purple'
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with your card',
        icon: 'credit-card',
        color: 'green'
      }
    ];
    
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods', error: error.message });
  }
};
