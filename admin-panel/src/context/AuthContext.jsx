import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clerkAvailable, setClerkAvailable] = useState(false);
  
  // Use Clerk hooks
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  
  useEffect(() => {
    setClerkAvailable(true);
    setIsLoading(!isLoaded);
  }, [isLoaded]);

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
