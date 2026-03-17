const { processJewelryImage } = require('./utils/imageProcessor');

async function test() {
  const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  try {
    console.log('Starting test...');
    const result = await processJewelryImage(dummyBase64);
    console.log('Result length:', result.length);
    console.log('Result starts with:', result.substring(0, 30));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
