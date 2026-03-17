const { Category, Product } = require('./models');
const sequelize = require('./config/database');

async function check() {
  try {
    const categories = await Category.findAll();
    console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
    
    const products = await Product.findAll({ limit: 5 });
    console.log('Sample Products:', products.map(p => ({ id: p.id, name: p.name, sku: p.sku })));
    
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
