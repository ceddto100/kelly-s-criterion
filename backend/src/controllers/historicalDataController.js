const HistoricalData = require('../models/historicalDataModel');
const { calculateEloRating, calculatePoissonProbability } = require('../utils/statisticalModels');

// Get historical data for a team
const getTeamHistory = async (req, res) => {
  try {
    const { sport, team, startDate, endDate } = req.query;
    
    const query = { sport, team };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const history = await HistoricalData.find(query)
      .sort({ date: -1 })
      .limit(100);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new historical data
const addHistoricalData = async (req, res) => {
  try {
    const {
      sport,
      team,
      opponent,
      date,
      stats,
      marketOdds,
      actualOutcome,
      score
    } = req.body;
    
    // Calculate model predictions
    const eloRating = await calculateEloRating(team, opponent, sport);
    const poisson = calculatePoissonProbability(stats.pointsScored, stats.pointsAllowed);
    
    const historicalData = await HistoricalData.create({
      sport,
      team,
      opponent,
      date,
      stats,
      marketOdds,
      modelPredictions: {
        eloRating,
        poisson
      },
      actualOutcome,
      score
    });
    
    res.status(201).json(historicalData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add user prediction
const addPrediction = async (req, res) => {
  try {
    const { historicalDataId } = req.params;
    const { predictedProbability, confidenceLevel } = req.body;
    
    const historicalData = await HistoricalData.findById(historicalDataId);
    if (!historicalData) {
      return res.status(404).json({ message: 'Historical data not found' });
    }
    
    historicalData.predictions.push({
      user: req.user._id,
      predictedProbability,
      confidenceLevel
    });
    
    await historicalData.save();
    res.json(historicalData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get prediction accuracy metrics
const getPredictionAccuracy = async (req, res) => {
  try {
    const { sport, team, startDate, endDate } = req.query;
    
    const query = { sport };
    if (team) query.team = team;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const historicalData = await HistoricalData.find(query);
    
    // Calculate overall metrics
    const metrics = {
      brierScore: 0,
      calibration: [],
      totalPredictions: 0,
      correctPredictions: 0
    };
    
    historicalData.forEach(data => {
      if (data.predictions.length > 0) {
        metrics.brierScore += data.calculateBrierScore();
        metrics.calibration.push(...data.calculateCalibration());
        metrics.totalPredictions += data.predictions.length;
        metrics.correctPredictions += data.predictions.filter(p => 
          p.actualOutcome === (data.actualOutcome === 'home_win' ? 'win' : 'loss')
        ).length;
      }
    });
    
    metrics.brierScore /= historicalData.length;
    metrics.accuracy = metrics.correctPredictions / metrics.totalPredictions;
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get model performance comparison
const getModelPerformance = async (req, res) => {
  try {
    const { sport, startDate, endDate } = req.query;
    
    const query = { sport };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const historicalData = await HistoricalData.find(query);
    
    const modelPerformance = {
      elo: { correct: 0, total: 0 },
      poisson: { correct: 0, total: 0 },
      regression: { correct: 0, total: 0 }
    };
    
    historicalData.forEach(data => {
      if (data.modelPredictions.eloRating) {
        modelPerformance.elo.total++;
        if ((data.actualOutcome === 'home_win' && data.modelPredictions.eloRating.predictedProbability > 0.5) ||
            (data.actualOutcome === 'away_win' && data.modelPredictions.eloRating.predictedProbability < 0.5)) {
          modelPerformance.elo.correct++;
        }
      }
      
      if (data.modelPredictions.poisson) {
        modelPerformance.poisson.total++;
        if ((data.actualOutcome === 'home_win' && data.modelPredictions.poisson.predictedProbability > 0.5) ||
            (data.actualOutcome === 'away_win' && data.modelPredictions.poisson.predictedProbability < 0.5)) {
          modelPerformance.poisson.correct++;
        }
      }
      
      if (data.modelPredictions.regression) {
        modelPerformance.regression.total++;
        if ((data.actualOutcome === 'home_win' && data.modelPredictions.regression.predictedProbability > 0.5) ||
            (data.actualOutcome === 'away_win' && data.modelPredictions.regression.predictedProbability < 0.5)) {
          modelPerformance.regression.correct++;
        }
      }
    });
    
    // Calculate accuracy for each model
    Object.keys(modelPerformance).forEach(model => {
      modelPerformance[model].accuracy = 
        modelPerformance[model].total > 0 ? 
        modelPerformance[model].correct / modelPerformance[model].total : 0;
    });
    
    res.json(modelPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeamHistory,
  addHistoricalData,
  addPrediction,
  getPredictionAccuracy,
  getModelPerformance
}; 