const TeamPerformance = require('../models/teamPerformanceModel');
const { 
  calculateRegressionAdjustment, 
  identifyCognitiveBiases,
  getSportSpecificRegressionFactors
} = require('../utils/regressionCalculations');

/**
 * Calculate regression adjustment for a specific team and metric
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateRegression = async (req, res) => {
  try {
    const {
      teamId,
      sport,
      metric,
      originalProbability,
      season
    } = req.body;

    if (!teamId || !sport || !metric || originalProbability === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters. Please provide teamId, sport, metric, and originalProbability.' 
      });
    }

    // Validate probability input
    const probability = parseFloat(originalProbability);
    if (isNaN(probability) || probability < 0 || probability > 1) {
      return res.status(400).json({ 
        error: 'Invalid probability. Value must be between 0 and 1.' 
      });
    }

    // Get the current season if not provided
    const currentSeason = season || new Date().getFullYear().toString();

    // Retrieve team performance data
    const team = await TeamPerformance.findOne({ 
      teamId, 
      sport, 
      season: currentSeason 
    });

    if (!team) {
      return res.status(404).json({ 
        error: 'Team performance data not found for the given parameters.' 
      });
    }

    // Get the specific metric data
    const metricData = team.getMetric(metric);
    if (!metricData) {
      return res.status(404).json({ 
        error: `No data found for metric "${metric}" for this team.` 
      });
    }

    // Calculate regression adjustment
    const regressionAnalysis = calculateRegressionAdjustment({
      currentPerformance: metricData.value,
      baseline: metricData.baseline,
      sampleSize: metricData.sampleSize,
      sport,
      metric,
      leagueAverage: metricData.leagueAverage,
      originalProbability: probability
    });

    // Identify potential cognitive biases
    const biases = identifyCognitiveBiases(regressionAnalysis);

    // Return the regression analysis and bias information
    res.status(200).json({
      teamName: team.teamName,
      sport,
      metric,
      regression: regressionAnalysis,
      potentialBiases: biases
    });
  } catch (error) {
    console.error('Error calculating regression:', error);
    res.status(500).json({ 
      error: 'An error occurred while calculating regression adjustment.' 
    });
  }
};

/**
 * Get regression factors for different sports and metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRegressionFactors = async (req, res) => {
  try {
    const { sport } = req.params;
    
    if (!sport) {
      return res.status(400).json({ 
        error: 'Sport parameter is required.' 
      });
    }

    // Get all metrics for the specified sport
    const metrics = {};
    const sportFactors = {
      basketball: ['threePointPercentage', 'freeThrowPercentage', 'fieldGoalPercentage', 'winPercentage', 'pointsPerGame', 'assistsPerGame'],
      baseball: ['battingAverage', 'onBasePercentage', 'sluggingPercentage', 'era', 'winPercentage'],
      football: ['passCompletionPercentage', 'yardsPerAttempt', 'winPercentage', 'fieldGoalPercentage'],
      soccer: ['scoringRate', 'winPercentage', 'cleanSheetRate', 'goalConversionRate'],
      hockey: ['shootingPercentage', 'savePercentage', 'winPercentage']
    };

    if (!sportFactors[sport]) {
      return res.status(404).json({ 
        error: `Sport "${sport}" not found or not supported.` 
      });
    }

    // Get regression factors for each metric
    sportFactors[sport].forEach(metric => {
      metrics[metric] = getSportSpecificRegressionFactors(sport, metric);
    });

    res.status(200).json({
      sport,
      metrics
    });
  } catch (error) {
    console.error('Error getting regression factors:', error);
    res.status(500).json({ 
      error: 'An error occurred while retrieving regression factors.' 
    });
  }
};

/**
 * Get team performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTeamMetrics = async (req, res) => {
  try {
    const { teamId, sport, season } = req.params;
    
    if (!teamId || !sport) {
      return res.status(400).json({ 
        error: 'TeamId and sport parameters are required.' 
      });
    }

    // Get the current season if not provided
    const currentSeason = season || new Date().getFullYear().toString();

    // Retrieve team performance metrics
    const metrics = await TeamPerformance.getTeamMetrics(teamId, sport, currentSeason);

    if (!metrics || metrics.length === 0) {
      return res.status(404).json({ 
        error: 'No metrics found for the given team and sport.' 
      });
    }

    // Get the team name
    const team = await TeamPerformance.findOne({ teamId, sport, season: currentSeason });
    
    res.status(200).json({
      teamId,
      teamName: team ? team.teamName : 'Unknown Team',
      sport,
      season: currentSeason,
      metrics
    });
  } catch (error) {
    console.error('Error getting team metrics:', error);
    res.status(500).json({ 
      error: 'An error occurred while retrieving team metrics.' 
    });
  }
};

/**
 * Add or update team performance metric
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTeamMetric = async (req, res) => {
  try {
    const {
      teamId,
      teamName,
      sport,
      league,
      season,
      metric,
      value,
      baseline,
      leagueAverage,
      sampleSize
    } = req.body;

    if (!teamId || !teamName || !sport || !league || !metric || value === undefined || baseline === undefined || leagueAverage === undefined || sampleSize === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters.' 
      });
    }

    // Get the current season if not provided
    const currentSeason = season || new Date().getFullYear().toString();

    // Find or create the team performance document
    let team = await TeamPerformance.findOne({ teamId, sport, season: currentSeason });
    
    if (!team) {
      team = new TeamPerformance({
        teamId,
        teamName,
        sport,
        league,
        season: currentSeason,
        currentMetrics: [],
        historicalPerformance: []
      });
    }

    // Update the metric
    team.updateMetric(metric, value, sampleSize, baseline, leagueAverage);

    // Add historical data point for this date
    const metricData = {};
    metricData[metric] = value;
    team.addHistoricalDataPoint(new Date(), metricData);

    // Save the updated team data
    await team.save();

    res.status(200).json({
      message: 'Team metric updated successfully.',
      team: {
        teamId,
        teamName,
        sport,
        league,
        season: currentSeason,
        metric,
        value,
        baseline,
        leagueAverage,
        sampleSize
      }
    });
  } catch (error) {
    console.error('Error updating team metric:', error);
    res.status(500).json({ 
      error: 'An error occurred while updating team metrics.' 
    });
  }
};

/**
 * Get historical performance data for regression analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getHistoricalData = async (req, res) => {
  try {
    const { teamId, sport, metric } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!teamId || !sport || !metric) {
      return res.status(400).json({ 
        error: 'TeamId, sport, and metric parameters are required.' 
      });
    }

    // Retrieve historical data
    const historicalData = await TeamPerformance.getHistoricalData(
      teamId, 
      sport, 
      metric, 
      startDate, 
      endDate
    );

    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({ 
        error: 'No historical data found for the given parameters.' 
      });
    }

    // Get the team name
    const team = await TeamPerformance.findOne({ teamId, sport });
    
    res.status(200).json({
      teamId,
      teamName: team ? team.teamName : 'Unknown Team',
      sport,
      metric,
      dateRange: {
        start: startDate || 'Earliest available',
        end: endDate || 'Latest available'
      },
      data: historicalData
    });
  } catch (error) {
    console.error('Error getting historical data:', error);
    res.status(500).json({ 
      error: 'An error occurred while retrieving historical data.' 
    });
  }
};

module.exports = {
  calculateRegression,
  getRegressionFactors,
  getTeamMetrics,
  updateTeamMetric,
  getHistoricalData
}; 