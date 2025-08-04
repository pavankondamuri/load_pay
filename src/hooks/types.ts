// Data types based on backend models

export interface User {
  _id?: string;
  email: string;
  password?: string;
  company: string[];
  vendorId: string[];
  paymentHistory: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  _id?: string;
  companyName: string;
  ownerName: string;
  email?: string;
  phoneNumber?: number;
  description?: string;
  paymentHistory: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Vendor {
  _id?: string;
  name: string;
  accountHolderName: string;
  accountNumber: number;
  ifscCode?: string;
  phoneNumber: number;
  vechicleNumber: string[];
  paymentHistory: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  amount: number;
  description?: string;
  paymentDate: string;
  companyId?: string;
  vendorId?: string;
  userId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
