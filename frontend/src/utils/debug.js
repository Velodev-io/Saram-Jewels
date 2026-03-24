// Debug utility to check environment variables
export const debugEnvVars = () => {
  console.log('=== Environment Variables Debug ===');
  console.log('REACT_APP_CLERK_PUBLISHABLE_KEY:', process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ? 'Found' : 'Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
  console.log('===================================');
};

// Check if Clerk key is valid
export const validateClerkKey = (key) => {
  if (!key) {
    console.error('❌ Clerk publishable key is missing');
    return false;
  }
  
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
    console.error('❌ Invalid Clerk publishable key format');
    return false;
  }
  
  console.log('✅ Clerk publishable key is valid');
  return true;
};
