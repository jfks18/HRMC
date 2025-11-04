// Fallback configuration for development
// This will be used when ngrok is not available

export const getBackendUrl = () => {
  // In production, always try the configured backend URL first
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || 'http://localhost:5000';
  }
  
  // In development, prefer ngrok but fallback to local
  const ngrokUrl = 'https://buck-leading-pipefish.ngrok-free.app';
  const localUrl = 'http://localhost:5000';
  
  // You can add a simple check here or just return the preferred URL
  return process.env.BACKEND_URL || ngrokUrl;
};

export const BACKEND_ENDPOINTS = {
  LOGIN: '/login',
  HEALTH: '/health',
  LEAVE_CREDIT: '/leave_cred',
  LEAVE_BALANCE: '/leave_balance',
  LEAVE_SUMMARY: '/leave_summary',
  USERS: '/users',
  EVALUATION: '/evaluation'
};

// Configuration for fetch requests
export const getFetchConfig = (options: any = {}) => {
  const config = {
    timeout: 5000, // 5 second timeout
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      ...(options.headers || {})
    },
    ...options
  };
  
  return config;
};