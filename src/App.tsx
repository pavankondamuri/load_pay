import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthLayout from '@/components/auth/AuthLayout';
import Index from '@/pages/Index';
import CompanyDashboard from '@/pages/CompanyDashboard';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import PaymentHistory from './pages/PaymentHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <main className="h-screen">
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/company/:companyId" element={<CompanyDashboard />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
