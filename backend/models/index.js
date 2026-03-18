const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const Review = require('./Review');
const Inquiry = require('./Inquiry');
const Address = require('./Address');

// Define relationships
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });

Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Cart, { foreignKey: 'product_id' });

Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });

module.exports = {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Cart,
  Review,
  Inquiry,
  Address
};

