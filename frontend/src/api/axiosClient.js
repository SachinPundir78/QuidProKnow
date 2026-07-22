import axios from 'axios';

let envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').trim().replace(/\/+$/, '');
if (!envUrl.endsWith('/api')) {
  envUrl += '/api';
}
const BASE_URL = envUrl;
console.log("API URL configured as:", BASE_URL);
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request once the user is logged in via Clerk.
axiosClient.interceptors.request.use(async (config) => {
  if (window.Clerk?.session) {
    const token = await window.Clerk.session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If the token is rejected or expired, Clerk handles refresh, but we can sign out.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.Clerk) {
        window.Clerk.signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
