import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import Navbar from './components/layout/Navbar';
import SignInPage from './components/auth/SignIn';
import SignUpPage from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { debugEnvVars, validateClerkKey } from './utils/debug';
// ...other imports for pages/components

const Home = React.lazy(() => import('./pages/Home'));
const Categories = React.lazy(() => import('./pages/Categories'));
const ProductList = React.lazy(() => import('./pages/ProductList'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Payment = React.lazy(() => import('./components/payment/PaymentGateway'));

// Notification Component
const Notification = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const borderColor = {
    success: 'border-[#e2e8f0]',
    error: 'border-red-500',
    warning: 'border-amber-400',
    info: 'border-blue-500'
  }[type] || 'border-[#334155]';

  return (
    <div className="fixed top-24 right-4 z-[200] animate-slide-down">
      <div className={`glass border ${borderColor} text-[#ffffff] px-6 py-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-sm min-w-[260px]`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              type === 'success' ? 'bg-[#e2e8f0]' :
              type === 'error' ? 'bg-red-400' :
              type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
            }`} />
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#e2e8f0] transition-colors text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  useEffect(() => {
    const handleShowNotification = (event) => {
      const { message, type = 'success' } = event.detail;
      setNotification({
        message,
        type,
        isVisible: true
      });

      // Auto hide after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    };

    window.addEventListener('showNotification', handleShowNotification);

    return () => {
      window.removeEventListener('showNotification', handleShowNotification);
    };
  }, []);

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  
  // Debug environment variables
  debugEnvVars();
  
  // Validate Clerk key
  const isClerkKeyValid = validateClerkKey(clerkPublishableKey);
  
  // If no key is available, show a fallback
  if (!isClerkKeyValid) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
          <p className="text-[#94a3b8] mb-4">Clerk publishable key is missing.</p>
          <p className="text-sm text-[#64748b]">Please check your .env file and restart the application.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthProvider>
        <CartProvider>
          <SiteSettingsProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-[#020617]">
            <Navbar />
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-[#020617]">
                <div className="w-10 h-10 border-2 border-[#334155] border-t-[#e2e8f0] rounded-full animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/payment" element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={<Contact />} />
                {/* Add more routes as needed */}
              </Routes>
            </React.Suspense>
            
            {/* Notification */}
            <Notification
              message={notification.message}
              type={notification.type}
              isVisible={notification.isVisible}
              onClose={closeNotification}
            />
                      </div>
            </Router>
          </SiteSettingsProvider>
        </CartProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
