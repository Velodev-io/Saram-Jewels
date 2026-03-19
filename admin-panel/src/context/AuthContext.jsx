import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clerkAvailable, setClerkAvailable] = useState(false);
  
  // Use Clerk hooks
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, getToken } = useClerkAuth();
  
  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          localStorage.setItem('clerk-token', token);
        } catch (err) {
          console.error("Token hydration failed:", err);
        }
      } else {
        localStorage.removeItem('clerk-token');
      }
    };
    
    syncToken();
    const interval = setInterval(syncToken, 45000); // Heartbeat: Refresh token every 45s
    setClerkAvailable(true);
    setIsLoading(!isLoaded);
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, getToken]);

  const validatePassword = (password) => {
    const errors = [];
    return { isValid: true, errors };
  };

  const login = async () => { return { success: true }; };
  const signup = async () => { return { success: true }; };
  const loginWithGoogle = async () => { return { success: true }; };
  const signupWithGoogle = async () => { return { success: true }; };
  const logout = async () => { return { success: true }; };

  const value = {
    user: user || null,
    isSignedIn,
    isLoaded: !isLoading,
    clerkAvailable,
    login,
    signup,
    loginWithGoogle,
    signupWithGoogle,
    logout,
    validatePassword
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
