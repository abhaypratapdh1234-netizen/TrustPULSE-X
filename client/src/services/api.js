import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustpulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trustpulse_token');
      localStorage.removeItem('trustpulse_user');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (prefs) => api.put('/auth/preferences', prefs),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── Users ───────────────────────────────────────────────────
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
};

// ─── Companies ───────────────────────────────────────────────
export const companyAPI = {
  getCompany: (name) => api.get(`/companies/${encodeURIComponent(name)}`),
  getTrending: () => api.get('/companies/trending'),
  getTopRated: (industry) => api.get(`/companies/top-rated${industry && industry !== 'All' ? `?industry=${industry}` : ''}`),
  getLowestRated: () => api.get('/companies/lowest-rated'),
  compare: (companies) => api.post('/companies/compare', { companies }),
  search: (q) => api.get(`/companies/search?q=${encodeURIComponent(q)}`),
};

// ─── Watchlist ───────────────────────────────────────────────
export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  add: (companyName) => api.post('/watchlist/add', { companyName }),
  remove: (companyName) => api.delete('/watchlist/remove', { data: { companyName } }),
};

export default api;
