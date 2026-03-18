const { Order, User, Product } = require('./models');
const sequelize = require('./config/database');

async function testCreateOrder() {
  const transaction = await sequelize.transaction();
  try {
    const orderData = {
      total_amount: 100.00,
      status: 'pending',
      payment_method: 'cod',
      shipping_address: { street: 'Main St', city: 'Delhi', zip: '110001' }
    };
    
    console.log('Attempting to create order...');
    const order = await Order.create(orderData, { transaction });
    console.log('✅ Order created! ID:', order.id);
    
    await transaction.rollback();
    process.exit(0);
  } catch (err) {
    console.error('❌ Order Creation Error:', err.name, err.message);
    if (err.errors) console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  }
}

testCreateOrder();
