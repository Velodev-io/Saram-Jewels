const sequelize = require('./config/database');
const { Review } = require('./models');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('DB Connection OK');
    await sequelize.sync();
    console.log('DB Sync OK');
    
    const count = await Review.count();
    console.log('Current review count:', count);
    
    const testReview = await Review.create({
      user_name: 'Test Agent',
      rating: 5,
      comment: 'Testing table existence'
    });
    console.log('Test review created:', testReview.id);
    await testReview.destroy();
    console.log('Cleanup OK');
    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

test();
