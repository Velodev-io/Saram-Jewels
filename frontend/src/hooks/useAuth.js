import { useUser } from '@clerk/clerk-react';

export const useAuth = () => {
  const clerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  
  // Always call the hook to follow React rules
  const { isSignedIn, user, isLoaded } = useUser();
  
  // If Clerk is not configured, return default values
  if (!clerkKey) {
    return {
      isSignedIn: false,
      user: null,
      isLoaded: true,
      isClerkConfigured: false
    };
  }
  
  // If Clerk is configured, return the actual values
  return {
    isSignedIn,
    user,
    isLoaded,
    isClerkConfigured: true
  };
};
