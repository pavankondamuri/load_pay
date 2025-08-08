import axios from 'axios';

const API_BASE_URL = 'https://pay-load-backend-kondamuri-pavan-kumars-projects.vercel.app/';

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
    api.post('/user/login', { email, password }),
  
  register: (email: string, password: string) => 
    api.post('/user/register', { email, password }),
  
  logout: () => 
    api.post('/user/logout'),
  
  getProfile: () => 
    api.get('/user/profile'),
};

export const companyAPI = {
  create: (data: any) => 
    api.post('/company/create', data),
  
  getAll: () => 
    api.get('/company/get'),
  
  getById: (id: string) => 
    api.get(`/company/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/company/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/company/${id}`),
};

export const vendorAPI = {
  create: (data: any) => 
    api.post('/vendor/create', data),
  
  getAll: () => 
    api.get('/vendor/get'),
  
  getById: (id: string) => 
    api.get(`/vendor/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/vendor/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/vendor/${id}`),
};

export const loadTypeAPI = {
  create: (data: any) => 
    api.post('/loadtype/create', data),
  
  getByCompany: (companyId: string) => 
    api.get(`/loadtype/company/${companyId}`),
  
  getById: (id: string) => 
    api.get(`/loadtype/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/loadtype/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/loadtype/${id}`),
};

export const paymentAPI = {
  createOrder: (data: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: any;
  }) => 
    api.post('/payments/create-order', data),
  
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
    api.post('/payments/verify', data),
  
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
    api.get('/payments/history', { params: filters }),
  
  getPaymentStats: (filters?: {
    companyId?: string;
    vendorId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => 
    api.get('/payments/stats', { params: filters }),
};

export default api; 