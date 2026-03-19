import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading spinner while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="w-10 h-10 border-2 border-[#334155] border-t-[#e2e8f0] rounded-full animate-spin" />
      </div>
    );
  }

  // If signed in, show the protected content
  return isSignedIn ? children : <Navigate to="/sign-in" />;
};

export default ProtectedRoute;
