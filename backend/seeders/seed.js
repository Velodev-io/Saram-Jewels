const sequelize = require('../config/database');
const { Category } = require('../models');
const seedProducts = require('./productSeeder');

const categoriesData = [
  { 
    name: 'Rings', 
    description: 'Beautiful American Diamond rings that are anti-tarnish and affordable', 
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Necklace', 
    description: 'Elegant American Diamond necklaces for all occasions', 
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Earrings', 
    description: 'Stunning American Diamond earrings that sparkle like real diamonds', 
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Chains', 
    description: 'Anti-tarnish American Diamond chains for everyday wear', 
    image: 'https://images.unsplash.com/photo-1620960308432-3adad55030e4?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Bracelets', 
    description: 'Elegant American Diamond bracelets that add a touch of luxury', 
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Necklace Set', 
    description: 'Complete American Diamond necklace sets for special occasions', 
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Gift Box Set', 
    description: 'Special Gift Box Sets including Necklace + Earring combo at ₹1000', 
    image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=800' 
  }
];

const seedCategories = async () => {
  try {
    await Category.bulkCreate(categoriesData);
    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

const seedDatabase = async () => {
  try {
    // Sync models with database
    await sequelize.sync({ force: true });
    console.log('Database synced');
    
    // Seed categories
    await seedCategories();
    
    // Seed products
    await seedProducts();
    
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();
