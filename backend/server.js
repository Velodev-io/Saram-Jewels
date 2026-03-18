const express = require('express');
const cors = require('cors');
const compression = require('compression');
const apicache = require('apicache');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const sequelize = require('./config/database');
require('./models'); // Ensure models and relations are registered

// Initialize express app
const app = express();

// Sync database - use safe sync that only creates missing tables
// Do NOT use alter:true as it causes unique constraint failures during column migration
sequelize.sync({ force: false }).then(() => {
  console.log('✅ Database synced successfully');
}).catch(err => {
  console.error('Database sync failed:', err.message);
});

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Init Cache
const cache = apicache.middleware;
const onlyStatus200 = (req, res) => res.statusCode === 200;
const cacheSuccess = cache('5 minutes', onlyStatus200);

// Import routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const addressRoutes = require('./routes/addressRoutes');

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Saram Jewelry API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    console.log('You can set a different port using the PORT environment variable.');
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
