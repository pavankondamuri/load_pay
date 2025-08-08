import axios from 'axios';

const API_BASE_URL = 'https://pay-load-backend.vercel.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/api/user/login', { email, password }),
  
  register: (email: string, password: string) => 
    api.post('/api/user/register', { email, password }),
  
  logout: () => 
    api.post('/api/user/logout'),
  
  getProfile: () => 
    api.get('/api/user/profile'),
};

export const companyAPI = {
  create: (data: any) => 
    api.post('/api/company/create', data),
  
  getAll: () => 
    api.get('/api/company/get'),
  
  getById: (id: string) => 
    api.get(`/api/company/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/company/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/api/company/${id}`),
};

export const vendorAPI = {
  create: (data: any) => 
    api.post('/api/vendor/create', data),
  
  getAll: () => 
    api.get('/api/vendor/get'),
  
  getById: (id: string) => 
    api.get(`/api/vendor/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/vendor/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/api/vendor/${id}`),
};

export const loadTypeAPI = {
  create: (data: any) => 
    api.post('/api/loadtype/create', data),
  
  getByCompany: (companyId: string) => 
    api.get(`/api/loadtype/company/${companyId}`),
  
  getById: (id: string) => 
    api.get(`/api/loadtype/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/loadtype/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/api/loadtype/${id}`),
};

export const paymentAPI = {
  createOrder: (data: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: any;
  }) => 
    api.post('/api/payments/create-order', data),
  
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
    vendorName: string;
    vendorId: string;
    companyName: string;
    companyId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    vehicleNumbers?: string[];
    loadTypeId?: string;
    loadTypeName?: string;
  }) => 
    api.post('/api/payments/verify', data),
  
  getPaymentHistory: (filters?: {
    vendorName?: string;
    companyName?: string;
    companyId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
    vehicleNumber?: string;
    loadTypeId?: string;
    globalSearch?: string;
    page?: number;
    limit?: number;
  }) => 
    api.get('/api/payments/history', { params: filters }),
  
  getPaymentStats: (filters?: {
    companyId?: string;
    vendorId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => 
    api.get('/api/payments/stats', { params: filters }),
};

export default api; 