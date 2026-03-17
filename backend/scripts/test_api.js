const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/categories', {
      name: 'Test Category ' + Date.now(),
      description: 'Test description',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    });
    console.log('Success:', res.data.name);
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

test();
