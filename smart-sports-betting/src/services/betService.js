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

const betService = {
  // Get all bets for current user
  getBets: async (filters = {}) => {
    try {
      const response = await api.get('/bets', { params: filters });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get single bet by id
  getBetById: async (betId) => {
    try {
      const response = await api.get(`/bets/${betId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new bet
  createBet: async (betData) => {
    try {
      const response = await api.post('/bets', betData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update bet
  updateBet: async (betId, betData) => {
    try {
      const response = await api.put(`/bets/${betId}`, betData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete bet
  deleteBet: async (betId) => {
    try {
      const response = await api.delete(`/bets/${betId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update bet result (win/loss/push/etc)
  updateBetResult: async (betId, result, profitLoss) => {
    try {
      const response = await api.put(`/bets/${betId}/result`, { result, profitLoss });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get betting stats
  getBettingStats: async (timeframe = 'all') => {
    try {
      const response = await api.get('/bets/stats', { params: { timeframe } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get bankroll history data
  getBankrollHistory: async (timeframe = 'all') => {
    try {
      const response = await api.get('/bets/bankroll-history', { params: { timeframe } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Calculate Kelly bet (could be client-side, but add server option for more complex models)
  calculateKelly: async (betData) => {
    try {
      const response = await api.post('/bets/calculate-kelly', betData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Helper function to handle API errors
function handleApiError(error) {
  if (error.response) {
    // Server responded with a non-2xx status
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response from server. Please check your internet connection.',
      status: 0
    };
  } else {
    // Error setting up the request
    return {
      message: error.message || 'Something went wrong',
      status: 0
    };
  }
}

export default betService; 