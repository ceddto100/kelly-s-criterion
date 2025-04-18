import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth header interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expired or unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token on auth errors
      localStorage.removeItem('token');
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock authentication service for development purposes

// Simulated user database
const users = [
  {
    id: '1',
    email: 'guest@example.com',
    password: 'guestpassword', // In a real app, never store plain text passwords
    name: 'Guest User',
    role: 'user'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'adminpassword',
    name: 'Admin User',
    role: 'admin'
  }
];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Login user
const login = async (email, password) => {
  // Simulate API call
  await delay(500);
  
  const user = users.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  
  // Strip password from user object
  const { password: _, ...userWithoutPassword } = user;
  
  // Create a mock token
  const token = `mock-jwt-token-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    user: userWithoutPassword,
    token
  };
};

// Register user
const register = async (userData) => {
  // Simulate API call
  await delay(500);
  
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  const newUser = {
    id: String(users.length + 1),
    ...userData,
    role: 'user'
  };
  
  users.push(newUser);
  
  // Strip password from user object
  const { password: _, ...userWithoutPassword } = newUser;
  
  // Create a mock token
  const token = `mock-jwt-token-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    user: userWithoutPassword,
    token
  };
};

// Get current user from token
const getCurrentUser = async () => {
  // Simulate API call
  await delay(200);
  
  // In a real app, this would decode JWT and validate it
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }
  
  // For demo purposes, return guest user
  const { password: _, ...userWithoutPassword } = users[0];
  return userWithoutPassword;
};

// Update user profile
const updateProfile = async (userData) => {
  // Simulate API call
  await delay(500);
  
  // In a real app, this would update the user in the database
  return {
    ...users[0],
    ...userData,
    password: undefined
  };
};

// Provider for Google Authentication
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Firebase user object
 */
export const loginWithEmailPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Firebase user object
 */
export const registerWithEmailPassword = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Sign in with Google
 * @returns {Promise<Object>} - Firebase user object
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Get current user's ID token
 * @returns {Promise<string|null>} - ID token or null if not authenticated
 */
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Get current user profile from API
 * @returns {Promise<Object|null>} - User profile or null if error
 */
export const getCurrentUserProfile = async () => {
  try {
    const token = await getIdToken();
    if (!token) return null;
    
    // Set up axios with the token
    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object|null>} - Updated user profile or null if error
 */
export const updateUserProfile = async (profileData) => {
  try {
    const token = await getIdToken();
    if (!token) return null;
    
    const response = await axios.put('/api/auth/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

const authService = {
  login,
  register,
  getCurrentUser,
  updateProfile,
  loginWithEmailPassword,
  registerWithEmailPassword,
  loginWithGoogle,
  logout,
  resetPassword,
  getIdToken,
  getCurrentUserProfile,
  updateUserProfile
};

export default authService; 