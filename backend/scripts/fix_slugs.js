const { Category } = require('./models');
const slugify = require('slugify');

async function fix() {
  try {
    const categories = await Category.findAll();
    for (const cat of categories) {
      if (!cat.slug) {
        const slug = slugify(cat.name, { lower: true, strict: true });
        console.log(`Fixing slug for ${cat.name} -> ${slug}`);
        await cat.update({ slug });
      }
    }
    console.log('Fixed all slugs');
    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
}

fix();
