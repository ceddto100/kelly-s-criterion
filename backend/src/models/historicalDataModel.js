const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema({
  // Team/Player Information
  sport: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  opponent: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  
  // Historical Statistics
  stats: {
    // Team/Player specific stats
    wins: Number,
    losses: Number,
    draws: Number,
    pointsScored: Number,
    pointsAllowed: Number,
    // Add more sport-specific stats as needed
  },
  
  // Market Data
  marketOdds: {
    home: Number,
    away: Number,
    spread: Number,
    overUnder: Number
  },
  
  // Prediction Data
  predictions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    predictedProbability: {
      type: Number,
      min: 0,
      max: 1
    },
    actualOutcome: {
      type: String,
      enum: ['win', 'loss', 'draw']
    },
    confidenceLevel: {
      type: Number,
      min: 1,
      max: 5
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Model Predictions
  modelPredictions: {
    eloRating: {
      homeTeamRating: Number,
      awayTeamRating: Number,
      predictedProbability: Number
    },
    poisson: {
      homeTeamExpectedGoals: Number,
      awayTeamExpectedGoals: Number,
      predictedProbability: Number
    },
    regression: {
      predictedProbability: Number,
      confidenceInterval: {
        lower: Number,
        upper: Number
      }
    }
  },
  
  // Outcome
  actualOutcome: {
    type: String,
    enum: ['home_win', 'away_win', 'draw']
  },
  score: {
    home: Number,
    away: Number
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
historicalDataSchema.index({ sport: 1, team: 1, date: 1 });
historicalDataSchema.index({ sport: 1, date: 1 });

// Methods for prediction accuracy analysis
historicalDataSchema.methods.calculateBrierScore = function() {
  const predictions = this.predictions.map(pred => ({
    probability: pred.predictedProbability,
    outcome: pred.actualOutcome === 'win' ? 1 : 0
  }));
  
  return predictions.reduce((score, pred) => {
    return score + Math.pow(pred.probability - pred.outcome, 2);
  }, 0) / predictions.length;
};

historicalDataSchema.methods.calculateCalibration = function() {
  // Group predictions into probability bins
  const bins = {};
  this.predictions.forEach(pred => {
    const bin = Math.floor(pred.predictedProbability * 10) / 10;
    if (!bins[bin]) {
      bins[bin] = { count: 0, wins: 0 };
    }
    bins[bin].count++;
    if (pred.actualOutcome === 'win') {
      bins[bin].wins++;
    }
  });
  
  return Object.entries(bins).map(([bin, data]) => ({
    predictedProbability: parseFloat(bin),
    actualWinRate: data.wins / data.count,
    count: data.count
  }));
};

const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

module.exports = HistoricalData; 