const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { processJewelryImage } = require('../utils/imageProcessor');

// Get all products with pagination
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
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
    const { name, description, price, originalPrice, category_id, stock, sku, is_featured, status } = req.body;
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
      status: status || 'active'
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category_id, stock, sku, is_featured, status } = req.body;
    let { images } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Process images if changed
    if (images && Array.isArray(images)) {
      images = await Promise.all(images.map(img => processJewelryImage(img)));
    }

    await product.update({
      name,
      description,
      price,
      original_price: originalPrice,
      category_id,
      images,
      stock,
      sku,
      is_featured,
      status
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.destroy();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
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
