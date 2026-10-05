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

const apiFormCall = async (endpoint, method, formData) => {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers, body: formData });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'API request failed');
  }
  return data;
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
  return apiCall('/auth/me', 'GET').then((data) => data.user);
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

export const getWorkshops = (period = 'upcoming') => apiCall(`/workshops?period=${period}`, 'GET');
export const getWorkshop = (id) => apiCall(`/workshops/${id}`, 'GET');
export const getAdminWorkshops = () => apiCall('/workshops/admin', 'GET');
export const createWorkshop = (formData) => apiFormCall('/workshops', 'POST', formData);
export const updateWorkshopCapacity = (id, capacity) => apiCall(`/workshops/${id}/capacity`, 'PATCH', { capacity });
export const registerForWorkshop = (id, registration) => apiCall(`/workshops/${id}/registrations`, 'POST', registration);
export const getWorkshopRegistrations = (id) => apiCall(`/workshops/${id}/registrations`, 'GET');
export const getAdminStats = () => apiCall('/admin/stats', 'GET');
