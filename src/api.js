const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic API request function with automatic token handling
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body (optional)
 * @returns {Promise<object>} - Response data
 */
export const apiCall = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add JWT token to headers if it exists
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
      // Handle 401 - token expired or invalid
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Signup new user
 */
export const signup = (fullName, email, password, confirmPassword) => {
  return apiCall('/auth/signup', 'POST', {
    fullName,
    email,
    password,
    confirmPassword,
  });
};

/**
 * Login user
 */
export const login = (email, password) => {
  return apiCall('/auth/login', 'POST', { email, password });
};

/**
 * Get current logged in user
 */
export const getCurrentUser = () => {
  return apiCall('/auth/me', 'GET');
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored user info
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
