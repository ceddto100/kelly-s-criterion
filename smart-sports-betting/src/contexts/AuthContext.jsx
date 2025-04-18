import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  loginWithGoogle, 
  logout, 
  resetPassword,
  getCurrentUserProfile
} from '../services/authService';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set up auth token for API requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        if (currentUser) {
          const token = await currentUser.getIdToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove the interceptor when the component unmounts
      axios.interceptors.request.eject(interceptor);
    };
  }, [currentUser]);

  // Load user profile
  const loadUserProfile = async () => {
    if (!currentUser) return null;
    
    try {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile');
      return null;
    }
  };

  // Set up authentication state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile();
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Clean up the observer on unmount
    return unsubscribe;
  }, []);

  // Authentication methods
  const register = async (email, password) => {
    try {
      setError('');
      await registerWithEmailPassword(email, password);
      await loadUserProfile();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      await loginWithEmailPassword(email, password);
      await loadUserProfile();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError('');
      await loginWithGoogle();
      await loadUserProfile();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      setError('');
      await logout();
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetUserPassword = async (email) => {
    try {
      setError('');
      await resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    register,
    login,
    loginWithGoogle: signInWithGoogle,
    logout: logoutUser,
    resetPassword: resetUserPassword,
    refreshUserProfile: loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext; 