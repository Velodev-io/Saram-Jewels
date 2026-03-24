const { Review, Product } = require('../models');
const apicache = require('apicache');

exports.createReview = async (req, res) => {
  try {
    const { user_name, rating, comment, product_id } = req.body;
    
    const review = await Review.create({
      user_name,
      rating,
      comment,
      product_id: product_id || null
    });

    // Update product rating and reviews count
    if (product_id) {
      try {
        const productReviews = await Review.findAll({ where: { product_id } });
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / productReviews.length).toFixed(1);
        
        await Product.update(
          { 
            rating: avgRating, 
            reviews_count: productReviews.length 
          },
          { where: { id: product_id } }
        );
      } catch (err) {
        console.error('Failed to update product stats after review:', err);
      }
    }
    
    
    // Invalidate caches to reflect new review
    apicache.clear();
    console.log('⚡ API Cache Purged after new review publication.');

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { product_id, general } = req.query;
    const where = {};
    
    // Distinction Logic
    if (product_id) {
       where.product_id = product_id;
    } else if (general === 'true') {
       where.product_id = null; // Only brand-level reviews
    }
    
    const reviews = await Review.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: product_id ? [] : [{ model: Product, as: 'product', attributes: ['name'] }]
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    await review.destroy();
    
    // Invalidate caches after removal
    apicache.clear();
    console.log('⚡ API Cache Purged after review removal.');

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
