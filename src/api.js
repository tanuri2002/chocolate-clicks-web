const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

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
 * Login / Signup with Google credential token
 */
export const googleLogin = (credential) => {
  return apiCall('/auth/google', 'POST', { credential });
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

export const getWorkshops = (period = 'upcoming', category = '') => {
  const params = new URLSearchParams({ period });
  if (category) params.append('category', category);
  return apiCall(`/workshops?${params.toString()}`, 'GET');
};
export const getWorkshop = (id) => apiCall(`/workshops/${id}`, 'GET');
export const getAdminWorkshops = () => apiCall('/workshops/admin', 'GET');
export const createWorkshop = (formData) => apiFormCall('/workshops', 'POST', formData);
export const updateWorkshopCapacity = (id, capacity) => apiCall(`/workshops/${id}/capacity`, 'PATCH', { capacity });
export const registerForWorkshop = (id, registration) => apiCall(`/workshops/${id}/registrations`, 'POST', registration);
export const getWorkshopRegistrations = (id) => apiCall(`/workshops/${id}/registrations`, 'GET');
export const deleteWorkshopRegistration = (regId) => apiCall(`/workshops/registrations/${regId}`, 'DELETE');
export const getAdminStats = () => apiCall('/admin/stats', 'GET');
export const getEventCategories = () => apiCall('/workshops/categories', 'GET');
export const createEventCategory = (categoryData) => apiCall('/workshops/categories', 'POST', categoryData);
export const deleteEventCategory = (id) => apiCall(`/workshops/categories/${id}`, 'DELETE');

// ── Events API ─────────────────────────────────────────────────────────────
export const getEvents = (type = 'all', category = '') => {
  const params = new URLSearchParams({ type });
  if (category) params.append('category', category);
  return apiCall(`/events?${params.toString()}`, 'GET');
};
export const createEvent = (formData) => apiFormCall('/events', 'POST', formData);
export const updateEvent = (id, formData) => apiFormCall(`/events/${id}`, 'PUT', formData);
export const updateEventSlots = (id, availableSlots) => apiCall(`/events/${id}/slots`, 'PATCH', { availableSlots });
export const deleteEvent = (id) => apiCall(`/events/${id}`, 'DELETE');


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
 * an image file (name, description, price, category, isActive, image).
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
 * Create a new order & obtain PayHere params
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
export const getAdminOrders = ({ status = '', search = '', page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
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
 * Get all registered customers (role !== 'admin')
 */
export const getAdminCustomers = () => {
  return apiCall('/admin/customers', 'GET');
};

// ── Analytics API ────────────────────────────────────────────────────────────
export const getAnalyticsSummary = (range = '30d') => {
  return apiCall(`/analytics/summary?range=${encodeURIComponent(range)}`, 'GET');
};

export const getAnalyticsSalesTrend = (range = '30d', granularity = 'day') => {
  return apiCall(
    `/analytics/sales-trend?range=${encodeURIComponent(range)}&granularity=${encodeURIComponent(granularity)}`,
    'GET'
  );
};

export const getAnalyticsTopProducts = (range = '30d', limit = 5) => {
  return apiCall(
    `/analytics/top-products?range=${encodeURIComponent(range)}&limit=${encodeURIComponent(limit)}`,
    'GET'
  );
};

export const getAnalyticsDemandHeatmap = (range = '30d') => {
  return apiCall(`/analytics/demand-heatmap?range=${encodeURIComponent(range)}`, 'GET');
};

export const getAnalyticsCustomers = (range = '30d') => {
  return apiCall(`/analytics/customers?range=${encodeURIComponent(range)}`, 'GET');
};

export const getAnalyticsForecast = () => {
  return apiCall('/analytics/forecast', 'GET');
};

/**
 * Update order fulfillment status with transition validation
 */
export const updateOrderStatus = (orderId, status) => {
  return apiCall(`/orders/${orderId}/status`, 'PATCH', { status });
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
