import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

// Adjust for production URL or local IP if running on physical device
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If there is no response, it means it's a network error (no internet or server down)
    if (!error.response) {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2: 'Please check your network settings and try again.',
        position: 'bottom',
      });
      return Promise.reject({ message: 'No Internet Connection' });
    }
    return Promise.reject(error);
  }
);

export default api;

export const toggleFollow = (userId: string) => api.post(`/users/${userId}/follow`);
export const addComment = (postId: string, content: string) => api.post(`/posts/${postId}/comments`, { content });
export const getComments = (postId: string) => api.get(`/posts/${postId}/comments`);
