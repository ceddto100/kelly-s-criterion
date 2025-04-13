const mongoose = require('mongoose');

const calibrationPointSchema = new mongoose.Schema({
  predictedProbability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  actualOutcome: {
    type: Boolean,
    required: true
  },
  betId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet',
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  betType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const calibrationMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  betType: {
    type: String,
    required: true
  },
  totalPredictions: {
    type: Number,
    default: 0
  },
  brierScore: {
    type: Number,
    default: 0
  },
  calibrationCurve: [{
    bin: {
      type: Number,
      required: true
    },
    predicted: {
      type: Number,
      required: true
    },
    actual: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  }],
  overconfidence: {
    type: Number,
    default: 0
  },
  underconfidence: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const calibrationRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  betType: {
    type: String,
    required: true
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['overconfidence', 'underconfidence', 'calibration', 'specific_range'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    suggestedAction: {
      type: String,
      required: true
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
calibrationPointSchema.index({ userId: 1, createdAt: -1 });
calibrationMetricsSchema.index({ userId: 1, sport: 1, betType: 1 });
calibrationRecommendationSchema.index({ userId: 1, sport: 1, betType: 1 });

module.exports = {
  CalibrationPoint: mongoose.model('CalibrationPoint', calibrationPointSchema),
  CalibrationMetrics: mongoose.model('CalibrationMetrics', calibrationMetricsSchema),
  CalibrationRecommendation: mongoose.model('CalibrationRecommendation', calibrationRecommendationSchema)
}; 