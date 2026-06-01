
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" || "https://blog-app-backend-two-nu.vercel.app/api",
  withCredentials: true, // MANDATORY for cookies/sessions
});
// Aise hona chahiye
const BASE_URL = import.meta.env.VITE_API_URL

console.log("API URL:", BASE_URL) // Debug ke liye

export const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})
// Attach JWT from localStorage (keeps parity with previous utils/api behaviour)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;