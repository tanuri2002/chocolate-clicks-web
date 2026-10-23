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
export const signup = (fullName, email, password, confirmPassword, phoneNo, address) => {
  return apiCall('/auth/signup', 'POST', {
    fullName,
    email,
    password,
    confirmPassword,
    phoneNo,
    address,
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

/**
 * Check if the logged in user is an admin
 */
export const isAdmin = () => {
  const user = getStoredUser();
  return !!user && user.role === 'admin';
};

/**
 * Get menu items (pass { all: true } for admin to get inactive items too)
 */
export const getMenuItems = (params = {}) => {
  const query = new URLSearchParams();
  if (params.all) query.append('all', 'true');
  const qs = query.toString() ? `?${query.toString()}` : '';
  return apiCall(`/menu${qs}`, 'GET');
};

/**
 * Create a menu item. `formData` is a FormData instance so it can carry
 * an image file (name, description, price, category, maxPerOrder, isActive, image).
 */
export const createMenuItem = (formData) => {
  return apiFormCall('/menu', 'POST', formData);
};

/**
 * Update a menu item. `formData` is a FormData instance (see createMenuItem).
 */
export const updateMenuItem = (id, formData) => {
  return apiFormCall(`/menu/${id}`, 'PUT', formData);
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = (id) => {
  return apiCall(`/menu/${id}`, 'DELETE');
};

/**
 * Create a new order & obtain PayHere params (or special order confirmation)
 */
export const createOrder = (orderData) => {
  return apiCall('/orders', 'POST', orderData);
};

/**
 * Get an order by ID
 */
export const getOrderById = (id) => {
  return apiCall(`/orders/${id}`, 'GET');
};

/**
 * Get current user orders
 */
export const getMyOrders = () => {
  return apiCall('/orders/mine', 'GET');
};

/**
 * Get all orders for admin with optional filters & pagination
 */
export const getAdminOrders = ({ status = '', type = '', search = '', page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (type) params.append('type', type);
  if (search && search.trim()) params.append('search', search.trim());
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/orders${queryString}`, 'GET');
};

/**
 * Get admin orders and customers summary calculated via MongoDB aggregation
 */
export const getAdminOrderSummary = () => {
  return apiCall('/orders/summary', 'GET');
};

/**
 * Update order fulfillment status with transition validation
 */
export const updateOrderStatus = (orderId, status) => {
  return apiCall(`/orders/${orderId}/status`, 'PATCH', { status });
};

/**
 * Accept or decline a special order
 */
export const decideSpecialOrder = (orderId, decision) => {
  return apiCall(`/orders/${orderId}/decision`, 'PATCH', { decision });
};

/**
 * Forgot password
 */
export const forgotPassword = (email) => {
  return apiCall('/auth/forgot-password', 'POST', { email });
};

/**
 * Reset password
 */
export const resetPassword = (token, newPassword) => {
  return apiCall('/auth/reset-password', 'POST', { token, newPassword });
};

/**
 * Like apiCall, but sends a FormData body (no Content-Type header, so the
 * browser can set the multipart boundary itself).
 */
const apiFormCall = async (endpoint, method, formData) => {
  const headers = {};

  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: formData,
    });
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
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
