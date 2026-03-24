const { Product, Category, OrderItem, Cart, Review } = require('../models');
const { Op } = require('sequelize');
const { processJewelryImage } = require('../utils/imageProcessor');
const apicache = require('apicache');

// Get all products with pagination
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      products: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('CRITICAL: Error fetching products from NeonDB:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message,
      detail: error.original?.message || error.stack
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const category = await Category.findOne({ where: { name: categoryName } });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const { count, rows } = await Product.findAndCountAll({
      where: { category_id: category.id },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      products: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Create new product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category_id, stock, sku, is_featured, status, specifications, rating, reviews_count, colors, sizes, video } = req.body;
    let { images } = req.body;
    
    // Fix all images: center, square, and optimize
    if (images && Array.isArray(images)) {
      images = await Promise.all(images.map(img => processJewelryImage(img)));
    }
    
    const product = await Product.create({
      name,
      description,
      price,
      original_price: originalPrice,
      category_id,
      images,
      stock,
      sku,
      is_featured,
      status: status || 'active',
      specifications,
      video,
      colors,
      sizes,
      variants,
      rating,
      reviews_count
    });
    
    // Invalidate caches to reflect new product
    apicache.clear();
    console.log('⚡ API Cache Purged after product creation.');

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category_id, stock, sku, is_featured, status, specifications, rating, reviews_count, colors, sizes, variants, video } = req.body;
    let { images } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Process images if changed
    if (images && Array.isArray(images)) {
      images = await Promise.all(images.map(img => processJewelryImage(img)));
    }

    const updateData = {};
    const fields = [
      'name', 'description', 'price', 'category_id', 'stock', 'sku', 
      'is_featured', 'status', 'specifications', 'video', 'rating', 'reviews_count'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (originalPrice !== undefined) updateData.original_price = originalPrice;
    if (images !== undefined) updateData.images = images;

    // Always set JSON array fields explicitly to force the DB write
    updateData.colors = Array.isArray(colors) ? colors : [];
    updateData.sizes = Array.isArray(sizes) ? sizes : [];
    updateData.variants = Array.isArray(variants) ? variants : [];

    // Use static update which always issues a real SQL UPDATE
    await Product.update(updateData, { where: { id: req.params.id } });

    const updated = await Product.findByPk(req.params.id);
    
    // Invalidate caches to reflect product update
    apicache.clear();
    console.log('⚡ API Cache Purged after product update.');

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  const sequelize = require('../config/database');
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(req.params.id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    // 1. Remove all cart entries referencing this product
    await Cart.destroy({ where: { product_id: product.id }, transaction });

    // 2. Remove all reviews for this product
    await Review.destroy({ where: { product_id: product.id }, transaction });

    // 3. Ensure the order_items.product_id column accepts NULL
    //    (in case DB schema hasn't been migrated yet via alter:true)
    try {
      await sequelize.query(
        `ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;`,
        { transaction }
      );
    } catch (alterErr) {
      // Already nullable or constraint doesn't exist — safe to continue
    }

    // 4. Nullify product_id in order items to preserve order history (price, quantity stay intact)
    await OrderItem.update(
      { product_id: null },
      { where: { product_id: product.id }, transaction }
    );

    // 5. Now safely delete the product
    await product.destroy({ transaction });

    await transaction.commit();
    
    // Invalidate caches to reflect product deletion
    apicache.clear();
    console.log('⚡ API Cache Purged after product removal.');

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      limit,
      offset,
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      products: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};
