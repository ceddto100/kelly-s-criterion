const mongoose = require('mongoose');

/**
 * Performance metric schema for storing individual performance metrics
 */
const performanceMetricSchema = new mongoose.Schema({
  metric: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  baseline: {
    type: Number,
    required: true
  },
  leagueAverage: {
    type: Number,
    required: true
  },
  sampleSize: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Historical performance schema for storing historical performance data
 */
const historicalPerformanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  metrics: {
    type: Map,
    of: Number,
    default: {}
  }
});

/**
 * Team performance schema for storing team/player performance data
 */
const teamPerformanceSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    index: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  league: {
    type: String,
    required: true,
    trim: true
  },
  season: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  currentMetrics: [performanceMetricSchema],
  historicalPerformance: [historicalPerformanceSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster lookups
teamPerformanceSchema.index({ teamId: 1, sport: 1, season: 1 }, { unique: true });

// Update updatedAt on save
teamPerformanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Method to get a specific performance metric
 */
teamPerformanceSchema.methods.getMetric = function(metricName) {
  return this.currentMetrics.find(metric => metric.metric === metricName);
};

/**
 * Method to add a historical data point
 */
teamPerformanceSchema.methods.addHistoricalDataPoint = function(date, metrics) {
  this.historicalPerformance.push({
    date,
    metrics: new Map(Object.entries(metrics))
  });
};

/**
 * Method to update a current metric
 */
teamPerformanceSchema.methods.updateMetric = function(metricName, value, sampleSize, baseline, leagueAverage) {
  const existingMetricIndex = this.currentMetrics.findIndex(m => m.metric === metricName);
  
  if (existingMetricIndex >= 0) {
    this.currentMetrics[existingMetricIndex].value = value;
    this.currentMetrics[existingMetricIndex].sampleSize = sampleSize;
    this.currentMetrics[existingMetricIndex].baseline = baseline;
    this.currentMetrics[existingMetricIndex].leagueAverage = leagueAverage;
    this.currentMetrics[existingMetricIndex].lastUpdated = new Date();
  } else {
    this.currentMetrics.push({
      metric: metricName,
      value,
      sampleSize,
      baseline,
      leagueAverage,
      lastUpdated: new Date()
    });
  }
};

/**
 * Static method to find teams by sport and league
 */
teamPerformanceSchema.statics.findBySportAndLeague = function(sport, league) {
  return this.find({ sport, league });
};

/**
 * Static method to get performance metrics for a specific team
 */
teamPerformanceSchema.statics.getTeamMetrics = async function(teamId, sport, season) {
  const team = await this.findOne({ teamId, sport, season });
  return team ? team.currentMetrics : [];
};

/**
 * Static method to get historical data for regression analysis
 */
teamPerformanceSchema.statics.getHistoricalData = async function(teamId, sport, metric, startDate, endDate) {
  const query = { teamId, sport };
  
  if (startDate || endDate) {
    query['historicalPerformance.date'] = {};
    if (startDate) query['historicalPerformance.date'].$gte = new Date(startDate);
    if (endDate) query['historicalPerformance.date'].$lte = new Date(endDate);
  }
  
  const team = await this.findOne(query);
  if (!team) return [];
  
  return team.historicalPerformance
    .filter(hp => {
      const date = new Date(hp.date);
      return (!startDate || date >= new Date(startDate)) && 
             (!endDate || date <= new Date(endDate));
    })
    .map(hp => ({
      date: hp.date,
      value: hp.metrics.get(metric)
    }))
    .filter(item => item.value !== undefined);
};

const TeamPerformance = mongoose.model('TeamPerformance', teamPerformanceSchema);

module.exports = TeamPerformance; 