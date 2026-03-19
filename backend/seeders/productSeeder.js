const { Product, Category } = require('../models');

const seedProducts = async () => {
  try {
    // Get category IDs
    const categories = await Category.findAll();
    const categoryMap = {};
    
    categories.forEach(category => {
      categoryMap[category.name] = category.id;
    });
    
    // Sample products data
    const productsData = [
      {
        name: 'Classic Solitaire Ring',
        description: 'A timeless solitaire American Diamond ring that never goes out of style. Anti-tarnish and perfect for everyday wear.',
        price: 599,
        category_id: categoryMap['Rings'],
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
        stock: 15,
        is_featured: true
      },
      {
        name: 'Princess Cut Halo Ring',
        description: 'Beautiful princess cut American Diamond with halo setting. Anti-tarnish and perfect for engagements.',
        price: 899,
        category_id: categoryMap['Rings'],
        images: ['https://images.unsplash.com/photo-1544733422-251e539ca221?auto=format&fit=crop&q=80&w=800'],
        stock: 10
      },
      
      // Necklaces
      {
        name: 'Classic Pendant Necklace',
        description: 'Elegant American Diamond pendant necklace with a simple chain. Anti-tarnish and perfect for any occasion.',
        price: 1499,
        category_id: categoryMap['Necklace'],
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'],
        stock: 8,
        is_featured: true
      },
      
      // Earrings
      {
        name: 'Stud Earrings',
        description: 'Classic American Diamond stud earrings. Anti-tarnish and perfect for everyday wear.',
        price: 399,
        category_id: categoryMap['Earrings'],
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'],
        stock: 25,
        is_featured: true
      },
      
      // Chains
      {
        name: 'Tennis Chain',
        description: 'Classic American Diamond tennis chain. Anti-tarnish and perfect for any outfit.',
        price: 1299,
        category_id: categoryMap['Chains'],
        images: ['https://images.unsplash.com/photo-1620960308432-3adad55030e4?auto=format&fit=crop&q=80&w=800'],
        stock: 7,
        is_featured: true
      },
      
      // Bracelets
      {
        name: 'Tennis Bracelet',
        description: 'Classic American Diamond tennis bracelet. Anti-tarnish and perfect for any occasion.',
        price: 899,
        category_id: categoryMap['Bracelets'],
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'],
        stock: 10,
        is_featured: true
      },
      
      // Necklace Sets
      {
        name: 'Bridal Necklace Set',
        description: 'Complete American Diamond bridal necklace set including necklace, earrings, and maang tikka. Anti-tarnish and perfect for weddings.',
        price: 4999,
        category_id: categoryMap['Necklace Set'],
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'],
        stock: 3,
        is_featured: true
      },
      
      // Gift Box Sets
      {
        name: 'Anniversary Gift Box',
        description: 'Special American Diamond Anniversary Gift Box including necklace and earrings. Anti-tarnish and perfect for anniversary gifts.',
        price: 1000,
        category_id: categoryMap['Gift Box Set'],
        images: ['https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=800'],
        stock: 20,
        is_featured: true
      }
    ];
    
    await Product.bulkCreate(productsData);
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

module.exports = seedProducts;
