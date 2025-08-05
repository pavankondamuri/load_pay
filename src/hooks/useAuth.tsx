import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  signup: (email: string, pass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);
  
  const login = async (email: string, pass: string) => {
    try {
      const response = await authAPI.login(email, pass);
      
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    
    // Optional: Call logout API
    authAPI.logout().catch(console.error);
  };

  const signup = async (email: string, pass: string) => {
    try {
      const response = await authAPI.register(email, pass);
      
      if (response.status === 200) {
        // After successful signup, automatically log in
        await login(email, pass);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 