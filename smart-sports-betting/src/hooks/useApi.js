import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const useApi = () => {
  const { user } = useAuth();

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests if user is logged in
  api.interceptors.request.use((config) => {
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  });

  return api;
};

export default useApi; 