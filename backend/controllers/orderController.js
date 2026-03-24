const { Order, OrderItem, Cart, Product, User } = require('../models');
const Razorpay = require('razorpay');
const sequelize = require('../config/database');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../services/emailService');
const apicache = require('apicache');

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
    const { user_id, shipping_address, payment_method = 'cod', items, amount, user_email, first_name, last_name } = req.body;
    
    console.log('📦 Starting order creation for:', user_email || user_id);
    
    let processedItems = [];
    let total_amount = amount || 0;
    let internal_user_id = null;

    // 1. Resolve or Create User
    if (user_id && user_id !== 'guest') {
      let user = await User.findOne({ 
        where: { clerk_user_id: user_id },
        transaction
      });
      
      if (!user && user_id.startsWith('user_') && user_email) {
        try {
          user = await User.create({
            clerk_user_id: user_id,
            email: user_email,
            first_name: first_name || 'Valued',
            last_name: last_name || 'Customer'
          }, { transaction });
          console.log(`✅ Created new user Record: ${user_id}`);
        } catch (uErr) {
          console.error('User creation failed, checking if already exists by email');
          user = await User.findOne({ where: { email: user_email }, transaction });
          if (user) {
             // Link existing email to this Clerk ID if it's missing
             await user.update({ clerk_user_id: user_id }, { transaction });
          } else {
             throw uErr; // Re-throw if it's a real failure
          }
        }
      }

      if (user) internal_user_id = user.id;
    }

    // 2. Process Items
    if (items && items.length > 0) {
      processedItems = items;
    } else {
      throw new Error('No items provided for order');
    }
    
    // 3. Create order Record
    console.log('💾 Saving Order to Vault...');
    const order = await Order.create({
      user_id: internal_user_id,
      total_amount: total_amount,
      status: 'pending',
      payment_method: payment_method,
      shipping_address: shipping_address
    }, { transaction });
    
    // 4. Create Order Items
    console.log('💍 Mapping Pieces to Order...');
    await Promise.all(processedItems.map(async (item) => {
      const prodId = item.product_id || item.id;
      if (!prodId) throw new Error('Product ID missing for item');
      
      const product = await Product.findByPk(prodId, { transaction });
      if (!product) {
        const err = new Error('PRODUCT_NOT_FOUND');
        err.detail = `Item ID ${prodId} no longer exists.`;
        throw err;
      }

      // Stock Management Engine
      const itemQty = parseInt(item.quantity || 1);
      
      // 1. Degrade Global Stock
      let newGlobalStock = Math.max(0, (parseInt(product.stock) || 0) - itemQty);
      
      // 2. Degrade Specific Variant Stock (if applicable)
      let newVariants = [...(product.variants || [])];
      let variantMatched = false;
      if (newVariants.length > 0) {
        newVariants = newVariants.map(v => {
          const colorMatch = (!v.color && !item.selected_color) || (v.color === item.selected_color);
          const sizeMatch = (!v.size && !item.selected_size) || (v.size === item.selected_size);
          if (colorMatch && sizeMatch) {
            variantMatched = true;
            return { ...v, stock: Math.max(0, (parseInt(v.stock) || 0) - itemQty) };
          }
          return v;
        });
      }

      // Update the product record in the vault
      await product.update({
        stock: newGlobalStock,
        variants: newVariants
      }, { transaction });

      return OrderItem.create({
        order_id: order.id,
        product_id: prodId,
        quantity: itemQty,
        price: item.price || 0,
        selected_color: item.selected_color || item.color || null,
        selected_size: item.selected_size || item.size || null
      }, { transaction });
    }));
    
    // 5. Clear Cart (Non-critical)
    if (internal_user_id) {
      await Cart.destroy({ where: { user_id: internal_user_id }, transaction });
    }
    
    await transaction.commit();
    console.log('🎯 Order Successfully Finalized:', order.id);

    // Synchronize Real-time Stock: Clear cache to reflect accurate inventory
    apicache.clear();
    console.log('⚡ API Cache Purged to synchronize inventory manifests.');

    // 6. Response
    res.status(201).json({
      success: true,
      order,
      order_number: order.id.slice(-8).toUpperCase(), // Friendly order number
      order_id: order.id
    });

    // 7. Background Notifications
    const customerEmail = user_email || (internal_user_id ? (await User.findByPk(internal_user_id))?.email : null);
    if (customerEmail) {
      // Fetch full order with items for email details
      const fullOrder = await Order.findByPk(order.id, {
        include: [{ 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }]
      });

      sendOrderConfirmationEmail({
        order_id: order.id,
        total_amount: total_amount,
        items: fullOrder.items,
        shipping_address: shipping_address
      }, customerEmail).catch(e => console.error('Confirmation email failed:', e));

      sendAdminOrderNotification({
        order_id: order.id,
        total_amount: total_amount,
        customer_name: first_name ? `${first_name} ${last_name}` : (shipping_address?.first_name ? `${shipping_address.first_name} ${shipping_address.last_name || ''}` : 'Valued Customer'),
        customer_email: customerEmail,
        payment_method: payment_method,
        items: fullOrder.items,
        shipping_address: shipping_address
      }).catch(e => console.error('Admin notification failed:', e));
    }

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('❌ CRITICAL ERROR IN CREATE ORDER:', error);
    
    // Friendly error for Migration issues (old cart items)
    if (error.message === 'MIGRATION_ERROR') {
      return res.status(400).json({
        success: false,
        message: 'Your cart contains items from our old gallery. Please clear your cart and select pieces from our new collection to proceed.',
        detail: error.detail
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to finalize your order. Please try again.', 
      error: error.message
    });
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
    
    // Send email notifications if payment successful
    if (payment_status === 'completed') {
      try {
        const orderWithUser = await Order.findByPk(order.id, {
          include: [{ model: User, as: 'user' }]
        });
        
        const customerEmail = orderWithUser.user?.email || 'customer@example.com';
        const customerName = orderWithUser.user ? `${orderWithUser.user.first_name} ${orderWithUser.user.last_name}` : 'Valued Customer';

        // Notify Customer
        await sendOrderConfirmationEmail({
          order_id: order.id,
          total_amount: order.total_amount
        }, customerEmail);

        // Notify Admin
        await sendAdminOrderNotification({
          order_id: order.id,
          total_amount: order.total_amount,
          customer_name: customerName,
          customer_email: customerEmail
        });
      } catch (emailErr) {
        console.error('Post-payment notification failed:', emailErr);
      }
    }

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
// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ['id', 'user_id', 'total_amount', 'status', 'payment_method', 'payment_status', 'shipping_address', 'tracking_number', 'shipping_carrier', 'created_at'],
      include: [
        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'sku', 'images'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    const ordersWithNumber = orders.map(o => {
      const orderData = o.toJSON();
      
      // Fallback for curator name (Guest orders)
      const firstName = orderData.user?.first_name || orderData.shipping_address?.first_name || 'Guest';
      const lastName = orderData.user?.last_name || orderData.shipping_address?.last_name || '';
      const email = orderData.user?.email || orderData.shipping_address?.email || 'Walk-in';

      return {
        ...orderData,
        order_number: o.id.slice(-8).toUpperCase(),
        curator: {
          name: `${firstName} ${lastName}`.trim(),
          email: email
        }
      };
    });
    
    res.json(ordersWithNumber);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};


// Get currently authenticated user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const user = req.localUser;
    if (!user) {
      return res.json({ success: true, data: [] });
    }
    
    const orders = await Order.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    const ordersWithNumber = orders.map(o => ({
      ...o.toJSON(),
      order_number: o.id.slice(-8).toUpperCase()
    }));
    
    res.json({ success: true, data: ordersWithNumber });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
};

// Get user's orders by explicit ID
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
    
    const ordersWithNumber = orders.map(o => ({
      ...o.toJSON(),
      order_number: o.id.slice(-8).toUpperCase()
    }));
    
    res.json({ success: true, data: ordersWithNumber });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
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
    const { status, tracking_number, shipping_carrier } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (shipping_carrier !== undefined) updateData.shipping_carrier = shipping_carrier;

    await order.update(updateData);
    
    res.json({ success: true, order });
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
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        description: 'Pay when your order arrives at your doorstep.',
        icon: 'truck',
        color: 'silver'
      }
    ];
    
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods', error: error.message });
  }
};
