import axios from 'axios';

const API_BASE_URL = '/api/market-odds';

/**
 * Fetch upcoming events with market odds data
 * @param {Object} params - Query parameters (sport, league, limit)
 * @returns {Promise<Array>} Promise resolving to events array
 */
export const getUpcomingEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`, { params });
    return response.data.events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

/**
 * Get market odds for a specific event
 * @param {string} eventId - The event ID
 * @param {string} marketType - Optional market type filter
 * @returns {Promise<Object>} Promise resolving to market odds data
 */
export const getMarketOdds = async (eventId, marketType = null) => {
  try {
    const url = marketType
      ? `${API_BASE_URL}/${eventId}/${marketType}`
      : `${API_BASE_URL}/${eventId}`;
    
    const response = await axios.get(url);
    return response.data.marketOdds;
  } catch (error) {
    console.error('Error fetching market odds:', error);
    throw error;
  }
};

/**
 * Compare user's probability with market implied probabilities
 * @param {Object} comparisonData - Data for comparison
 * @param {string} comparisonData.eventId - The event ID
 * @param {string} comparisonData.marketType - Market type (moneyline, spread, etc.)
 * @param {number} comparisonData.userProbability - User's estimated probability (0-1)
 * @param {string} comparisonData.outcome - Outcome to compare (home, away, draw)
 * @returns {Promise<Object>} Promise resolving to comparison results
 */
export const compareOdds = async (comparisonData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/compare`, comparisonData);
    return response.data;
  } catch (error) {
    console.error('Error comparing odds:', error);
    throw error;
  }
};

/**
 * Update market odds for an event
 * @param {Object} oddsData - Market odds data to update
 * @returns {Promise<Object>} Promise resolving to updated market odds
 */
export const updateMarketOdds = async (oddsData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/update`, oddsData);
    return response.data;
  } catch (error) {
    console.error('Error updating market odds:', error);
    throw error;
  }
};

/**
 * Register for an external odds API (for admin use)
 * @param {string} apiName - Name of the API service
 * @param {string} apiKey - API key to store
 * @returns {Promise<Object>} Promise resolving to registration result
 */
export const registerExternalOddsAPI = async (apiName, apiKey) => {
  try {
    const response = await axios.post('/api/admin/register-odds-api', {
      apiName,
      apiKey
    });
    return response.data;
  } catch (error) {
    console.error('Error registering external odds API:', error);
    throw error;
  }
};

/**
 * Fetch available bookmakers
 * @returns {Promise<Array>} Promise resolving to available bookmakers list
 */
export const getAvailableBookmakers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookmakers`);
    return response.data.bookmakers;
  } catch (error) {
    console.error('Error fetching available bookmakers:', error);
    throw error;
  }
};

export default {
  getUpcomingEvents,
  getMarketOdds,
  compareOdds,
  updateMarketOdds,
  registerExternalOddsAPI,
  getAvailableBookmakers
}; 