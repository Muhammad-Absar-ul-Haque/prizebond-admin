// src/services/api.js

const BASE_URL = 'http://52.0.177.84:3000/api/v1/local';

/**
 * Generic request helper for API calls
 */
async function request(endpoint, options = {}) {
  let token = localStorage.getItem('token');

  // Strict check for invalid token values
  if (token === 'undefined' || token === 'null') {
    localStorage.removeItem('token');
    token = null;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const isAuthError = response.status === 401 || (response.status === 403 && data.message === 'User not authenticated');

      if (isAuthError && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        throw new Error('AUTH_EXPIRED');
      }
      const errorMsg = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ── Auth Endpoints ─────────────────────────────────────────────────────────────

export const auth = {
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  sendOtp: (email) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  verifyOtp: (email, otp) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),

  resetPin: (resetData) => request('/auth/reset-pin', {
    method: 'POST',
    body: JSON.stringify(resetData),
  }),

  getMe: () => request('/auth/me', {
    method: 'GET',
  }),
};

// ── User Management Endpoints ─────────────────────────────────────────────────

export const users = {
  listAll: (status) => request(`/admin/user-management/users${status ? `?status=${status}` : ''}`, {
    method: 'GET',
  }),

  getById: (id) => request(`/users/${id}`, {
    method: 'GET',
  }),

  updateStatus: (id, status) => request(`/admin/user-management/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

// ── Legacy Exports (for backward compatibility during migration) ──────────────
// These can be removed once all components are updated to use the objects above.
export const listUsers = users.listAll;
export const getUserById = users.getById;
export const updateUserStatus = users.updateStatus;

