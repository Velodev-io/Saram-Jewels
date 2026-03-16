import axios from 'axios';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.REACT_APP_STRAPI_API_TOKEN;

// Create axios instance for Strapi API
const strapiApi = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  },
});

// Add request interceptor to include Clerk token
strapiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers['X-Clerk-Token'] = `Bearer ${token}`; // Prevent overwriting Strapi API token
    }
    
    // Ensure Strapi API Token is always present if defined
    if (STRAPI_API_TOKEN && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service class
class ApiService {
  // Product APIs
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) {
        queryParams.append('filters[category][slug][$eq]', params.category);
      }
      
      if (params.featured) {
        queryParams.append('filters[is_featured][$eq]', true);
      }
      
      if (params.search) {
        queryParams.append('filters[name][$containsi]', params.search);
      }
      
      if (params.populate) {
        queryParams.append('populate', params.populate);
      }
      
      if (params.pagination) {
        queryParams.append('pagination[page]', params.pagination.page || 1);
        queryParams.append('pagination[pageSize]', params.pagination.pageSize || 12);
      }

      const response = await strapiApi.get(`/api/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(slug) {
    try {
      const response = await strapiApi.get(`/api/products?filters[slug][$eq]=${slug}&populate=*`);
      return response.data.data[0];
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const response = await strapiApi.get(`/api/products/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  // Category APIs
  async getCategories() {
    try {
      const response = await strapiApi.get('/api/categories?populate=*');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategory(slug) {
    try {
      const response = await strapiApi.get(`/api/categories?filters[slug][$eq]=${slug}&populate=*`);
      return response.data.data[0];
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // User APIs
  async getCurrentUser() {
    try {
      const response = await strapiApi.get('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await strapiApi.put(`/api/users/${userId}`, {
        data: userData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Order APIs
  async createOrder(orderData) {
    try {
      const response = await strapiApi.post('/api/orders', {
        data: orderData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId) {
    try {
      const response = await strapiApi.get(`/api/orders?filters[user][id][$eq]=${userId}&populate=*`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async updateOrder(orderId, orderData) {
    try {
      const response = await strapiApi.put(`/api/orders/${orderId}`, {
        data: orderData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Cart APIs (using localStorage for now, can be moved to Strapi later)
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
          name: product.attributes.name,
          price: product.attributes.price,
          image: product.attributes.images?.[0]?.url,
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
      const response = await strapiApi.post('/api/contacts', {
        data: contactData
      });
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
    
    if (image.url) {
      return image.url.startsWith('http') 
        ? image.url 
        : `${STRAPI_URL}${image.url}`;
    }
    
    return null;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
