const { Category } = require('./models');
const slugify = require('slugify');

async function test() {
  try {
    const name = "Suryansh Singh " + Date.now();
    const slug = slugify(name, { lower: true, strict: true });
    
    await Category.create({
      name,
      slug,
      description: "bgbtbfbvdgrrhjsrths",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    });
    console.log('Success');
  } catch (err) {
    if (err.errors) {
       console.error('Validation errors:', err.errors.map(e => e.message));
    } else {
       console.error('Failed:', err.message);
    }
  }
}
test();
