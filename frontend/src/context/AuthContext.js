import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clerkAvailable, setClerkAvailable] = useState(false);
  
  // Use Clerk hooks
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();
  
  useEffect(() => {
    setClerkAvailable(true);
    setIsLoading(!isLoaded);
  }, [isLoaded]);

  // Sync Clerk token to localStorage for ApiService
  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn && getToken) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('clerk-token', token);
          }
        } catch (error) {
          console.error('Error syncing Clerk token:', error);
        }
      } else if (!isSignedIn) {
        localStorage.removeItem('clerk-token');
      }
    };

    if (isLoaded) {
      syncToken();
      // Optionally set up an interval to refresh token every 15 mins
      const interval = setInterval(syncToken, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, isLoaded, getToken]);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const login = async (email, password) => {
    try {
      if (!clerkAvailable) {
        return { success: false, error: 'Clerk authentication is not configured' };
      }
      
      // For Clerk, we redirect to the sign-in page
      window.location.href = '/sign-in';
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (email, password, firstName, lastName) => {
    try {
      if (!clerkAvailable) {
        return { success: false, error: 'Clerk authentication is not configured' };
      }
      
      // For Clerk, we redirect to the sign-up page
      window.location.href = '/sign-up';
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!clerkAvailable) {
        return { success: false, error: 'Clerk authentication is not configured' };
      }
      
      // Redirect to Clerk's OAuth sign-in
      window.location.href = '/sign-in?oauth=google';
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message || 'Google login failed' };
    }
  };

  const signupWithGoogle = async () => {
    try {
      if (!clerkAvailable) {
        return { success: false, error: 'Clerk authentication is not configured' };
      }
      
      // Redirect to Clerk's OAuth sign-up
      window.location.href = '/sign-up?oauth=google';
      return { success: true };
    } catch (error) {
      console.error('Google signup error:', error);
      return { success: false, error: error.message || 'Google signup failed' };
    }
  };

  const redactName = (name) => {
    if (!name) return name;
    // Redact specific identity
    if (name.toLowerCase().includes('suryansh')) return 'Patron';
    return name;
  };

  const logout = async () => {
    try {
      if (clerkAvailable && signOut) {
        await signOut();
      }
      localStorage.removeItem('clerk-token');
      // Clear Saram Caches on logout for security
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('saram_cache_')) localStorage.removeItem(k);
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const processedUser = user ? {
    ...user,
    firstName: redactName(user.firstName),
    lastName: redactName(user.lastName),
    fullName: redactName(user.fullName),
    username: redactName(user.username)
  } : null;

  const value = {
    user: processedUser,
    isSignedIn,
    isLoaded: !isLoading,
    clerkAvailable,
    login,
    signup,
    signupWithGoogle,
    logout,
    validatePassword,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
