import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

class ApiService {
  // Product APIs
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  }

  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  // Categories API
  async getCustomers() {
    const response = await api.get('/users/all');
    return response.data;
  }
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  }

  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  }

  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }

  // Orders API
  async getOrders() {
    const response = await api.get('/orders/all'); // Admin route
    return response.data;
  }

  async getUserOrders(userId) {
    const response = await api.get(`/orders/${userId}`);
    return response.data;
  }

  async getOrder(id) {
    const response = await api.get(`/orders/order/${id}`);
    return response.data;
  }

  async updateOrderStatus(id, status, tracking_number, shipping_carrier) {
    const response = await api.put(`/orders/${id}/status`, { status, tracking_number, shipping_carrier });
    return response.data;
  }

  // Reviews API
  async getReviews() {
    const response = await api.get('/reviews');
    return response.data;
  }

  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }

  // Inquiry APIs
  async getInquiries() {
    const response = await api.get('/contact');
    return response.data;
  }

  async updateInquiryStatus(id, status) {
    const response = await api.put(`/contact/${id}/status`, { status });
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
export { api };
