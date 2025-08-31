// Utility functions for Clerk authentication

export const getAuthToken = async (auth) => {
  try {
    if (auth && auth.getToken) {
      const token = await auth.getToken();
      if (token) {
        localStorage.setItem('clerk-token', token);
        return token;
      }
    }
    return localStorage.getItem('clerk-token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem('clerk-token');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('clerk-token', token);
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};
