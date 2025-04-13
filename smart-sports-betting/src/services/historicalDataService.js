import axios from 'axios';

const API_BASE_URL = '/api/historical-data';

/**
 * Get historical data for a team
 * @param {Object} params - Query parameters
 * @param {string} params.sport - Sport name
 * @param {string} params.team - Team name or ID
 * @param {string} params.startDate - Optional start date (ISO format)
 * @param {string} params.endDate - Optional end date (ISO format)
 * @returns {Promise<Array>} - Promise resolving to historical data array
 */
export const getTeamHistory = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/team`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching team history:', error);
    throw error;
  }
};

/**
 * Add new historical data
 * @param {Object} data - Historical data to add
 * @param {string} data.sport - Sport name
 * @param {string} data.team - Team name or ID
 * @param {string} data.opponent - Opponent name or ID
 * @param {string} data.date - Event date (ISO format)
 * @param {Object} data.stats - Performance statistics
 * @param {Object} data.marketOdds - Market odds data
 * @param {string} data.actualOutcome - Actual outcome (e.g., 'home_win', 'away_win', 'draw')
 * @param {Object} data.score - Score data
 * @returns {Promise<Object>} - Promise resolving to created historical data
 */
export const addHistoricalData = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding historical data:', error);
    throw error;
  }
};

/**
 * Add user prediction to historical data
 * @param {string} historicalDataId - Historical data ID
 * @param {Object} prediction - Prediction data
 * @param {number} prediction.predictedProbability - User's probability estimate
 * @param {number} prediction.confidenceLevel - User's confidence level
 * @returns {Promise<Object>} - Promise resolving to updated historical data
 */
export const addPrediction = async (historicalDataId, prediction) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${historicalDataId}/predictions`, prediction);
    return response.data;
  } catch (error) {
    console.error('Error adding prediction:', error);
    throw error;
  }
};

/**
 * Get prediction accuracy metrics
 * @param {Object} params - Query parameters
 * @param {string} params.sport - Sport name
 * @param {string} params.team - Optional team name or ID
 * @param {string} params.startDate - Optional start date (ISO format)
 * @param {string} params.endDate - Optional end date (ISO format)
 * @returns {Promise<Object>} - Promise resolving to accuracy metrics
 */
export const getPredictionAccuracy = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/accuracy`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction accuracy:', error);
    throw error;
  }
};

/**
 * Get model performance comparison
 * @param {Object} params - Query parameters
 * @param {string} params.sport - Sport name
 * @param {string} params.startDate - Optional start date (ISO format)
 * @param {string} params.endDate - Optional end date (ISO format)
 * @returns {Promise<Object>} - Promise resolving to model performance data
 */
export const getModelPerformance = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/model-performance`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching model performance:', error);
    throw error;
  }
};

export default {
  getTeamHistory,
  addHistoricalData,
  addPrediction,
  getPredictionAccuracy,
  getModelPerformance
}; 