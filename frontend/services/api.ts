import axios from 'axios';

// The Toggle Function
export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};

// The Axios API Client
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true, // Crucial for Django Session Cookies and CSRF
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to fetch CSRF token on initialization
export const fetchCsrfToken = async () => {
  if (isMockMode()) return;
  try {
    const res = await api.get('/api/accounts/csrf/');
    if (res.data?.csrfToken) {
      api.defaults.headers.common['X-CSRFToken'] = res.data.csrfToken;
      return res.data.csrfToken;
    }
  } catch (error) {
    console.warn("Django backend CSRF token check paused or backend offline:", error);
  }
};

// Request interceptor to attach CSRF token if available in cookies
api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='));
    
    if (csrfCookie) {
      config.headers['X-CSRFToken'] = csrfCookie.split('=')[1];
    }
  }
  return config;
});
