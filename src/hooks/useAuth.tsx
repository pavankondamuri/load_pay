import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  signup: (email: string, pass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);
  
  const login =  async (email: string, pass: string) => {
    const response=await axios.post("http://localhost:3000/api/user/login",{email,password:pass})
    console.log(response,"response login")
    if(response.status===200){
      setIsAuthenticated(true);
      localStorage.setItem("token",response.data.token);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const signup =  async (email: string, pass: string) => {
    const response=await axios.post("http://localhost:3000/api/user/register",{email,password:pass})
    // const users = JSON.parse(localStorage.getItem('users') || '[]');
    // const userExists = users.some((u: any) => u.email === email);
    // if (userExists) {
    //   throw new Error('User with this email already exists');
    // }
    console.log(response,"response singup")
    // const newUser = { email, password: pass };
    // localStorage.setItem('users', JSON.stringify([...users, newUser]));
    setIsAuthenticated(true);
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