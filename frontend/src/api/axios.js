// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // On any 401, clear the token and let the app handle logout
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Don't redirect here; let React handle it via ProtectedRoute
    }
    return Promise.reject(error);
  }
);

export default api;
