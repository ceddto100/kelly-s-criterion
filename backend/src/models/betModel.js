const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Game Details
  sport: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  betType: {
    type: String,
    required: true,
    enum: ['moneyline', 'spread', 'overUnder', 'prop']
  },

  // Odds and Probability
  odds: {
    type: Number,
    required: true
  },
  userProbability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  impliedProbability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  edge: {
    type: Number,
    required: true
  },
  confidenceLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },

  // Kelly Criterion Calculations
  kellyFraction: {
    type: Number,
    required: true
  },
  fractionMultiplier: {
    type: Number,
    default: 1,
    min: 0,
    max: 1
  },
  
  // Bet Details
  stake: {
    type: Number,
    required: true,
    min: 0
  },
  potentialProfit: {
    type: Number,
    required: true
  },
  bankrollRiskPercentage: {
    type: Number,
    required: true
  },
  
  // Outcome
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled', 'push'],
    default: 'pending'
  },
  result: {
    type: Number,
    default: 0  // Actual profit/loss amount
  },
  settledAt: {
    type: Date
  },

  // Analysis
  notes: {
    type: String
  },
  tags: [{
    type: String
  }],
  analysis: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    recommendation: {
      type: String,
      enum: ['bet', 'no bet']
    }
  }
}, {
  timestamps: true
});

// Calculate potential payout before saving
betSchema.pre('save', function(next) {
  if (this.isModified('stake') || this.isModified('odds')) {
    if (this.odds > 0) {
      this.potentialProfit = this.stake * (this.odds / 100);
    } else {
      this.potentialProfit = this.stake * (100 / Math.abs(this.odds));
    }
  }
  next();
});

// Methods for bet analysis
betSchema.methods.calculateROI = function() {
  if (this.status === 'won' || this.status === 'lost') {
    return (this.result / this.stake) * 100;
  }
  return null;
};

const Bet = mongoose.model('Bet', betSchema);
module.exports = Bet; 