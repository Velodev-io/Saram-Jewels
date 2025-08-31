import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const ClerkProviderWrapper = ({ children }) => {
  const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey) {
    console.warn('Clerk publishable key not found. Please set REACT_APP_CLERK_PUBLISHABLE_KEY in your .env file');
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWrapper;
