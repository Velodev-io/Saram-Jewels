import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance for Custom Backend API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Clerk token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service class
class ApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 600000; // 10 minutes default
    this.persistedKeyPrefix = 'saram_cache_';
  }

  getCache(key) {
    // Check L1 (In-Memory)
    const item = this.cache.get(key);
    if (item && Date.now() < item.expiry) {
      return item.data;
    }

    // Check L2 (LocalStorage)
    try {
      const persisted = localStorage.getItem(this.persistedKeyPrefix + key);
      if (persisted) {
        const { data, expiry } = JSON.parse(persisted);
        if (Date.now() < expiry) {
          // Hydrate L1
          this.cache.set(key, { data, expiry });
          return data;
        } else {
          localStorage.removeItem(this.persistedKeyPrefix + key);
        }
      }
    } catch (e) {
      console.warn('L2 Cache hydration failed for', key);
    }
    
    return null;
  }

  setCache(key, data, customTTL = null) {
    const ttl = customTTL || this.cacheTTL;
    const cacheItem = {
      data,
      expiry: Date.now() + ttl
    };

    // Update L1
    this.cache.set(key, cacheItem);

    // Update L2 (Public/Read-heavy data only for safety)
    if (key.startsWith('products') || key.startsWith('categories') || key.startsWith('reviews')) {
      try {
        localStorage.setItem(this.persistedKeyPrefix + key, JSON.stringify(cacheItem));
      } catch (e) {
        console.warn('L2 Cache storage failed for', key);
      }
    }
  }

  invalidateCache(key) {
    if (key === 'all') {
      this.cache.clear();
      // Clear L2
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(this.persistedKeyPrefix)) localStorage.removeItem(k);
      });
      return;
    }
    
    // Support partial matching
    for (let cacheKey of this.cache.keys()) {
      if (cacheKey.startsWith(key) || (key === 'products' && cacheKey.startsWith('product_'))) {
        this.cache.delete(cacheKey);
        localStorage.removeItem(this.persistedKeyPrefix + cacheKey);
      }
    }
  }

  // Product APIs
  async getProducts(params = {}) {
    const cacheKey = `products_${JSON.stringify(params)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/products', { params });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(slug) {
    try {
      // Custom backend uses slug or ID. 
      const response = await api.get(`/products/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProductById(id) {
    const cacheKey = `product_${id}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/products/${id}`);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  // Category APIs
  async getCategories() {
    const cacheKey = 'categories';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/categories');
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategory(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // User APIs
  async getCurrentUser() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async updateUser(userData) {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Address APIs
  async getAddresses() {
    const cacheKey = 'addresses';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/addresses');
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  async addAddress(addressData) {
    try {
      const response = await api.post('/addresses', addressData);
      this.invalidateCache('addresses');
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  async updateAddress(id, addressData) {
    try {
      const response = await api.put(`/addresses/${id}`, addressData);
      this.invalidateCache('addresses');
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(id) {
    try {
      const response = await api.delete(`/addresses/${id}`);
      this.invalidateCache('addresses');
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  async setDefaultAddress(id) {
    try {
      const response = await api.patch(`/addresses/${id}/set-default`);
      this.invalidateCache('addresses');
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  async getInquiries() {
    try {
      const response = await api.get('/contact/inquiries');
      return response.data;
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return { success: false, data: [] };
    }
  }

  // Order APIs
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders/create', orderData);
      // Invalidate products and categories cache so that stock changes are reflected
      this.invalidateCache('products');
      this.invalidateCache('categories');
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrders() {
    try {
      const response = await api.get('/orders/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserOrders() {
    try {
      const response = await api.get('/orders/my-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Cart APIs (using localStorage)
  getCart() {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  saveCart(cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  addToCart(product, quantity = 1) {
    try {
      const cart = this.getCart();
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0], // Assuming custom backend returns array of strings
          quantity
        });
      }
      
      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  removeFromCart(productId) {
    try {
      const cart = this.getCart();
      const updatedCart = cart.filter(item => item.id !== productId);
      this.saveCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  updateCartItemQuantity(productId, quantity) {
    try {
      const cart = this.getCart();
      const item = cart.find(item => item.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          return this.removeFromCart(productId);
        } else {
          item.quantity = quantity;
          this.saveCart(cart);
          return cart;
        }
      }
      
      return cart;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  clearCart() {
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // Contact APIs
  async submitContact(contactData) {
    try {
      const response = await api.post('/contact', contactData);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact:', error);
      throw error;
    }
  }

  // Utility methods
  formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  }

  getImageUrl(image) {
    if (!image) return null;
    if (typeof image === 'string') return image;
    return image.url || null;
  }

  // Review APIs
  async getReviews(params = {}) {
    // Standardize cache key based on params
    const cacheKey = `reviews_${JSON.stringify(params)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // params can be a single ID (legacy) or an object { productId, general }
      const query = typeof params === 'object' ? {
        product_id: params.productId,
        general: params.general ? 'true' : undefined
      } : { product_id: params };
      
      const response = await api.get('/reviews', { 
        params: { ...query, _t: Date.now() } 
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async createReview(reviewData) {
    try {
      const response = await api.post('/reviews', reviewData);
      // Synchronize stories and ledger
      this.invalidateCache('reviews');
      this.invalidateCache('products');
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async deleteReview(id) {
    try {
      const response = await api.delete(`/reviews/${id}`);
      // Synchronize manifest after removal
      this.invalidateCache('reviews');
      this.invalidateCache('products');
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
export { api };

