const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}/api/users${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Password reset API calls
export const forgotPasswordAPI = (email: string) => 
  apiCall('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const verifyOtpAPI = (email: string, otp: string) => 
  apiCall('/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const resetPasswordAPI = (email: string, newPassword: string, confirmPassword: string) => 
  apiCall('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword, confirmPassword }),
  });