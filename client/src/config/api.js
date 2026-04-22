import axios from 'axios';

/**
 * Centralised axios instance.
 * Base URL is read from the VITE_API_URL environment variable so it works
 * in every environment (local dev, phone via LAN, Vercel/deployed, etc.)
 * without touching individual files.
 *
 * Local dev  → .env              → http://localhost:5000
 * Production → .env.production   → your deployed backend URL
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 10000,
});

// Automatically attach the JWT token from localStorage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
