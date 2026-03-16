import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance for Express API
const expressApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { getAuthToken } from '../utils/authUtils';

// Function to get auth token (will be called from components)
const getStoredAuthToken = async () => {
  try {
    return localStorage.getItem('clerk-token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Add request interceptor to include Clerk token
expressApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service class for Express backend
class ExpressApiService {
  // User APIs
  async getCurrentUser() {
    try {
      const response = await expressApi.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Product APIs
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) {
        queryParams.append('category', params.category);
      }
      
      if (params.featured) {
        queryParams.append('featured', 'true');
      }
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      if (params.page) {
        queryParams.append('page', params.page);
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit);
      }

      const response = await expressApi.get(`/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(id) {
    try {
      const response = await expressApi.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Cart APIs
  async getCart() {
    try {
      const response = await expressApi.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  async addToCart(productId, quantity = 1) {
    try {
      const response = await expressApi.post('/cart/items', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      const response = await expressApi.put(`/cart/items/${itemId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(itemId) {
    try {
      const response = await expressApi.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      const response = await expressApi.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Order APIs
  async createOrder(orderData) {
    try {
      const response = await expressApi.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders() {
    try {
      const response = await expressApi.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const response = await expressApi.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Contact APIs
  async submitContact(contactData) {
    try {
      const response = await expressApi.post('/contact', contactData);
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
}

// Create singleton instance
const expressApiService = new ExpressApiService();

export default expressApiService;
