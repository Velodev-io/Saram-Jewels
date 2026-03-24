const { User, Address } = require('./models');
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

async function test() {
  try {
    console.log('Finding or creating a test user...');
    let user = await User.findOne();
    if (!user) {
      console.log('No user found, creating one...');
      user = await User.create({
        clerk_user_id: 'test_' + Date.now(),
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      });
    }
    console.log('Creating address for user:', user.id);
    
    const addrData = {
      user_id: user.id,
      name: 'Test User',
      phone: '1234567890',
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      zip: '123456',
      locality: 'Test Locality',
      house_no: '123',
      label: 'Home',
      is_default: true
    };
    
    const newAddr = await Address.create(addrData);
    console.log('✅ Address created successfully:', newAddr.id);
    
    // Clean up
    await newAddr.destroy();
    console.log('Test address cleaned up.');
    
  } catch (err) {
    console.error('❌ Test failed!');
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
