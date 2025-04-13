const mongoose = require('mongoose');

const bookmakerOddsSchema = new mongoose.Schema({
  bookmaker: {
    type: String,
    required: true,
    trim: true
  },
  homeOdds: {
    type: Number,
    required: true
  },
  awayOdds: {
    type: Number,
    required: true
  },
  drawOdds: {
    type: Number,
    default: null
  },
  oddsFormat: {
    type: String,
    enum: ['american', 'decimal', 'fractional'],
    default: 'decimal'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const marketOddsSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: true,
    trim: true
  },
  league: {
    type: String,
    required: true,
    trim: true
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  eventId: {
    type: String,
    required: true
  },
  homeTeam: {
    type: String,
    required: true,
    trim: true
  },
  awayTeam: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  marketType: {
    type: String,
    enum: ['moneyline', 'spread', 'total', 'prop'],
    required: true
  },
  pointSpread: {
    type: Number,
    default: null
  },
  total: {
    type: Number,
    default: null
  },
  bookmakerOdds: [bookmakerOddsSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
marketOddsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for faster querying
marketOddsSchema.index({ sport: 1, league: 1, startTime: 1 });
marketOddsSchema.index({ eventId: 1 }, { unique: true });

const MarketOdds = mongoose.model('MarketOdds', marketOddsSchema);

module.exports = MarketOdds; 