const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Bankroll history entry schema
const bankrollHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bet_result', 'adjustment'],
    required: true
  },
  betId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  
  // Bankroll Management
  bankroll: {
    type: Number,
    default: 0
  },
  initialBankroll: {
    type: Number
  },
  currency: {
    type: String,
    default: 'USD'
  },
  bankrollHistory: [bankrollHistorySchema],

  // Risk Management Settings
  riskSettings: {
    defaultFractionMultiplier: {
      type: Number,
      default: 0.5,  // Half Kelly by default
      min: 0,
      max: 1
    },
    maxBetPercentage: {
      type: Number,
      default: 0.1,  // 10% max bet size
      min: 0,
      max: 1
    },
    stopLossPercentage: {
      type: Number,
      default: 0.2,  // 20% daily stop loss
      min: 0,
      max: 1
    },
    stopWinPercentage: {
      type: Number,
      default: 0.5,  // 50% daily stop win
      min: 0
    },
    maxOpenBets: {
      type: Number,
      default: 5
    },
    maxConsecutiveLosses: {
      type: Number,
      default: 3
    },
    unitSizingEnabled: {
      type: Boolean,
      default: false
    },
    baseUnitSize: {
      type: Number,
      default: 100  // Base amount for 1-unit bets
    }
  },

  // Performance Tracking
  performance: {
    totalBets: {
      type: Number,
      default: 0
    },
    wonBets: {
      type: Number,
      default: 0
    },
    lostBets: {
      type: Number,
      default: 0
    },
    pushBets: {
      type: Number,
      default: 0
    },
    totalProfit: {
      type: Number,
      default: 0
    },
    roi: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0  // Positive for wins, negative for losses
    },
    bestStreak: {
      type: Number,
      default: 0
    },
    worstStreak: {
      type: Number,
      default: 0
    },
    consecutiveLosses: {
      type: Number,
      default: 0
    }
  },

  // Preferences
  preferences: {
    defaultSport: String,
    oddsFormat: {
      type: String,
      enum: ['american', 'decimal', 'fractional'],
      default: 'american'
    },
    timeZone: String,
    emailNotifications: {
      type: Boolean,
      default: true
    },
    showConfidenceSlider: {
      type: Boolean,
      default: true
    },
    defaultConfidenceLevel: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Set initial bankroll when first deposited
userSchema.pre('save', function(next) {
  if (this.isModified('bankroll') && !this.initialBankroll) {
    this.initialBankroll = this.bankroll;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Update performance stats
userSchema.methods.updatePerformanceStats = function() {
  const totalBets = this.performance.wonBets + this.performance.lostBets + this.performance.pushBets;
  if (totalBets > 0) {
    this.performance.winRate = (this.performance.wonBets / totalBets) * 100;
    this.performance.roi = (this.performance.totalProfit / this.initialBankroll) * 100;
  }
};

// Add bankroll history entry
userSchema.methods.addBankrollHistoryEntry = function(amount, change, reason, betId = null) {
  this.bankrollHistory.push({
    amount,
    change,
    reason,
    betId
  });
};

// Update streak information
userSchema.methods.updateStreak = function(isWin) {
  if (isWin) {
    if (this.performance.currentStreak < 0) {
      this.performance.currentStreak = 1;
    } else {
      this.performance.currentStreak++;
    }
    this.performance.consecutiveLosses = 0;
  } else {
    if (this.performance.currentStreak > 0) {
      this.performance.currentStreak = -1;
    } else {
      this.performance.currentStreak--;
    }
    this.performance.consecutiveLosses++;
  }

  // Update best/worst streaks
  if (this.performance.currentStreak > this.performance.bestStreak) {
    this.performance.bestStreak = this.performance.currentStreak;
  }
  if (this.performance.currentStreak < this.performance.worstStreak) {
    this.performance.worstStreak = this.performance.currentStreak;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User; 