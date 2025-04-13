const mongoose = require('mongoose');

/**
 * Factor weight schema for storing user-defined weights for factors
 */
const factorWeightSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 10, // Weight scale from 0-10
    default: 5
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema for storing factor values and correlations
 */
const factorValueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be boolean, number, or string
    required: true
  },
  contribution: {
    type: Number, // Probability contribution
    default: 0
  }
});

/**
 * Factor template schema for storing user-created factor templates
 */
const factorTemplateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  factors: [String], // Array of factor IDs
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema for defining factors that can affect game outcomes
 */
const factorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  sports: {
    type: [String],
    default: ['all'] // 'all' means applicable to all sports
  },
  inputType: {
    type: String,
    required: true,
    enum: ['binary', 'scale', 'percentage', 'select'],
    default: 'scale'
  },
  options: [String], // For 'select' input type
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  minValue: Number, // For 'scale' input type
  maxValue: Number, // For 'scale' input type
  step: Number, // For 'scale' and 'percentage' input types
  statisticalWeight: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 5 // Default statistical significance weight
  },
  historicalImpact: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5 // Historical correlation with outcomes (0-1)
  },
  correlations: {
    type: Map,
    of: Number, // Correlation coefficients with other factors (-1 to 1)
    default: {}
  },
  userWeights: {
    type: Map,
    of: factorWeightSchema,
    default: {}
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String, // User ID for custom factors
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema for storing factor analysis results
 */
const factorAnalysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  event: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true,
    trim: true
  },
  factors: [factorValueSchema],
  finalProbability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  confidenceInterval: {
    lower: Number,
    upper: Number
  },
  actualOutcome: {
    type: Boolean,
    default: null // true if prediction was correct, false if incorrect
  },
  templateUsed: {
    type: String, // Reference to template ID if used
    sparse: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
factorSchema.index({ key: 1, category: 1 });
factorSchema.index({ sports: 1 });
factorAnalysisSchema.index({ userId: 1, sport: 1, createdAt: -1 });
factorTemplateSchema.index({ userId: 1, sport: 1 });

// Pre-save hook to update timestamps
factorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

factorTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Method to get user weight for a specific user
 */
factorSchema.methods.getUserWeight = function(userId) {
  const userWeight = this.userWeights.get(userId);
  return userWeight ? userWeight.value : this.statisticalWeight;
};

/**
 * Method to update user weight
 */
factorSchema.methods.setUserWeight = function(userId, value) {
  if (!this.userWeights) {
    this.userWeights = new Map();
  }
  
  this.userWeights.set(userId, {
    userId,
    value,
    lastUpdated: new Date()
  });
};

/**
 * Static method to find factors by sport
 */
factorSchema.statics.findBySport = function(sport) {
  return this.find({
    $or: [
      { sports: 'all' },
      { sports: sport }
    ]
  });
};

/**
 * Static method to find factors by category
 */
factorSchema.statics.findByCategory = function(category, sport) {
  const query = { category };
  
  if (sport) {
    query.$or = [
      { sports: 'all' },
      { sports: sport }
    ];
  }
  
  return this.find(query);
};

const Factor = mongoose.model('Factor', factorSchema);
const FactorAnalysis = mongoose.model('FactorAnalysis', factorAnalysisSchema);
const FactorTemplate = mongoose.model('FactorTemplate', factorTemplateSchema);

module.exports = {
  Factor,
  FactorAnalysis,
  FactorTemplate
}; 