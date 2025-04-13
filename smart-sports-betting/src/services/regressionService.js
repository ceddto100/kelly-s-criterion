import axios from 'axios';

const API_BASE_URL = '/api/regression';

/**
 * Calculate regression adjustment for a team and metric
 * @param {Object} params - Regression parameters
 * @param {string} params.teamId - Team identifier
 * @param {string} params.sport - Sport name
 * @param {string} params.metric - Performance metric
 * @param {number} params.originalProbability - User's original probability estimate
 * @param {string} params.season - Optional season identifier
 * @returns {Promise<Object>} - Promise resolving to regression analysis data
 */
export const calculateRegression = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/calculate`, params);
    return response.data;
  } catch (error) {
    console.error('Error calculating regression:', error);
    throw error;
  }
};

/**
 * Get regression factors for a specific sport
 * @param {string} sport - Sport name (e.g., 'basketball', 'baseball')
 * @returns {Promise<Object>} - Promise resolving to regression factors
 */
export const getFactorsForSport = async (sport) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/factors/${sport}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching regression factors:', error);
    throw error;
  }
};

/**
 * Get team performance metrics
 * @param {string} teamId - Team identifier
 * @param {string} sport - Sport name
 * @param {string} season - Optional season identifier
 * @returns {Promise<Object>} - Promise resolving to team metrics
 */
export const getTeamMetrics = async (teamId, sport, season = null) => {
  try {
    const url = season 
      ? `${API_BASE_URL}/team/${teamId}/${sport}/${season}`
      : `${API_BASE_URL}/team/${teamId}/${sport}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    throw error;
  }
};

/**
 * Update a team performance metric
 * @param {Object} metricData - Team metric data
 * @returns {Promise<Object>} - Promise resolving to updated team data
 */
export const updateTeamMetric = async (metricData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/team/update`, metricData);
    return response.data;
  } catch (error) {
    console.error('Error updating team metric:', error);
    throw error;
  }
};

/**
 * Get historical performance data for a team and metric
 * @param {string} teamId - Team identifier
 * @param {string} sport - Sport name
 * @param {string} metric - Performance metric
 * @param {Object} dateRange - Optional date range
 * @param {string} dateRange.startDate - Start date (ISO format)
 * @param {string} dateRange.endDate - End date (ISO format)
 * @returns {Promise<Object>} - Promise resolving to historical data
 */
export const getHistoricalData = async (teamId, sport, metric, dateRange = {}) => {
  try {
    let url = `${API_BASE_URL}/history/${teamId}/${sport}/${metric}`;
    
    // Add date range query parameters if provided
    const params = {};
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

/**
 * Get the supported metrics for a specific sport
 * @param {string} sport - Sport name
 * @returns {Promise<Array>} - Promise resolving to array of supported metrics
 */
export const getSupportedMetrics = async (sport) => {
  try {
    const factors = await getFactorsForSport(sport);
    return Object.keys(factors.metrics);
  } catch (error) {
    console.error('Error fetching supported metrics:', error);
    throw error;
  }
};

export default {
  calculateRegression,
  getFactorsForSport,
  getTeamMetrics,
  updateTeamMetric,
  getHistoricalData,
  getSupportedMetrics
}; 