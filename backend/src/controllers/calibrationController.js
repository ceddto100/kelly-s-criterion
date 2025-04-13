const { CalibrationPoint, CalibrationMetrics, CalibrationRecommendation } = require('../models/calibrationModel');
const Bet = require('../models/betModel');

// Calculate Brier score
const calculateBrierScore = (predictions) => {
  if (predictions.length === 0) return 0;
  
  const sum = predictions.reduce((acc, { predictedProbability, actualOutcome }) => {
    const outcome = actualOutcome ? 1 : 0;
    return acc + Math.pow(predictedProbability - outcome, 2);
  }, 0);
  
  return sum / predictions.length;
};

// Calculate calibration curve
const calculateCalibrationCurve = (predictions, numBins = 10) => {
  const bins = Array(numBins).fill().map(() => ({
    predicted: 0,
    actual: 0,
    count: 0
  }));
  
  predictions.forEach(({ predictedProbability, actualOutcome }) => {
    const binIndex = Math.min(Math.floor(predictedProbability * numBins), numBins - 1);
    bins[binIndex].predicted += predictedProbability;
    bins[binIndex].actual += actualOutcome ? 1 : 0;
    bins[binIndex].count += 1;
  });
  
  return bins.map((bin, index) => ({
    bin: index / numBins,
    predicted: bin.count > 0 ? bin.predicted / bin.count : 0,
    actual: bin.count > 0 ? bin.actual / bin.count : 0,
    count: bin.count
  }));
};

// Calculate over/under confidence
const calculateConfidenceMetrics = (calibrationCurve) => {
  let overconfidence = 0;
  let underconfidence = 0;
  
  calibrationCurve.forEach(({ predicted, actual, count }) => {
    if (count > 0) {
      if (predicted > actual) {
        overconfidence += (predicted - actual) * count;
      } else if (predicted < actual) {
        underconfidence += (actual - predicted) * count;
      }
    }
  });
  
  return { overconfidence, underconfidence };
};

// Generate recommendations based on calibration metrics
const generateRecommendations = (metrics) => {
  const recommendations = [];
  
  // Check for overconfidence
  if (metrics.overconfidence > 0.1) {
    recommendations.push({
      type: 'overconfidence',
      description: 'You tend to be overconfident in your predictions',
      severity: metrics.overconfidence > 0.2 ? 'high' : 'medium',
      suggestedAction: 'Consider being more conservative with your probability estimates'
    });
  }
  
  // Check for underconfidence
  if (metrics.underconfidence > 0.1) {
    recommendations.push({
      type: 'underconfidence',
      description: 'You tend to be underconfident in your predictions',
      severity: metrics.underconfidence > 0.2 ? 'high' : 'medium',
      suggestedAction: 'Consider being more confident in your probability estimates'
    });
  }
  
  // Check calibration curve for specific ranges
  metrics.calibrationCurve.forEach(({ bin, predicted, actual, count }) => {
    if (count > 5 && Math.abs(predicted - actual) > 0.15) {
      recommendations.push({
        type: 'specific_range',
        description: `Significant calibration error in the ${(bin * 100).toFixed(0)}-${((bin + 0.1) * 100).toFixed(0)}% range`,
        severity: 'medium',
        suggestedAction: 'Review your prediction methodology for this probability range'
      });
    }
  });
  
  return recommendations;
};

// Update calibration metrics for a user
const updateCalibrationMetrics = async (req, res) => {
  try {
    const { sport, betType } = req.body;
    
    // Get all predictions for the user
    const predictions = await CalibrationPoint.find({
      userId: req.user._id,
      sport,
      betType
    });
    
    if (predictions.length === 0) {
      return res.status(404).json({ error: 'No predictions found' });
    }
    
    // Calculate metrics
    const brierScore = calculateBrierScore(predictions);
    const calibrationCurve = calculateCalibrationCurve(predictions);
    const { overconfidence, underconfidence } = calculateConfidenceMetrics(calibrationCurve);
    
    // Update or create metrics
    const metrics = await CalibrationMetrics.findOneAndUpdate(
      { userId: req.user._id, sport, betType },
      {
        totalPredictions: predictions.length,
        brierScore,
        calibrationCurve,
        overconfidence,
        underconfidence,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Generate and update recommendations
    const recommendations = generateRecommendations(metrics);
    await CalibrationRecommendation.findOneAndUpdate(
      { userId: req.user._id, sport, betType },
      {
        recommendations,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ metrics, recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get calibration metrics for a user
const getCalibrationMetrics = async (req, res) => {
  try {
    const { sport, betType } = req.query;
    
    const metrics = await CalibrationMetrics.findOne({
      userId: req.user._id,
      sport,
      betType
    });
    
    if (!metrics) {
      return res.status(404).json({ error: 'No metrics found' });
    }
    
    const recommendations = await CalibrationRecommendation.findOne({
      userId: req.user._id,
      sport,
      betType
    });
    
    res.json({ metrics, recommendations: recommendations?.recommendations || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record a new prediction and outcome
const recordPrediction = async (req, res) => {
  try {
    const { betId, predictedProbability, actualOutcome, sport, betType } = req.body;
    
    // Verify bet exists and belongs to user
    const bet = await Bet.findOne({ _id: betId, user: req.user._id });
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    // Create calibration point
    const calibrationPoint = await CalibrationPoint.create({
      userId: req.user._id,
      betId,
      predictedProbability,
      actualOutcome,
      sport,
      betType
    });
    
    // Update metrics
    await updateCalibrationMetrics(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateCalibrationMetrics,
  getCalibrationMetrics,
  recordPrediction
}; 