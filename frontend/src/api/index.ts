import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Adjust for Android emulator (10.0.2.2) or local IP if running on physical device
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.106:4040/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
