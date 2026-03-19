const { Category, Product } = require('../models');
const slugify = require('slugify');
const { processJewelryImage } = require('../utils/imageProcessor');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{
        model: Product,
        as: 'products'
      }]
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    let { image } = req.body;
    
    // Process image to fix aspect ratio and background
    if (image) {
      image = await processJewelryImage(image);
    }
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if slug or name exists
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ message: 'A collection with this name or legacy already exists.' });
    }
    
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      status: status || 'active'
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('CRITICAL: category creation failed:', error);
    // Log to a file I can read
    const fs = require('fs');
    fs.appendFileSync('/tmp/backend-error.txt', `\n[${new Date().toISOString()}] Create Category Error: ${error.message}\n${error.stack}\n`);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    let { image } = req.body;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Process image if changed
    if (image && image !== category.image) {
      image = await processJewelryImage(image);
    }

    const updateData = { name, description, image, status };

    // Only update slug if name is provided and changed
    if (name && name !== category.name) {
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    
    await category.update(updateData);
    
    res.json(category);
  } catch (error) {
    console.error('CRITICAL: category update failed:', error);
    const fs = require('fs');
    fs.appendFileSync('/tmp/backend-error.txt', `\n[${new Date().toISOString()}] Update Category Error: ${error.message}\n${error.stack}\n`);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
