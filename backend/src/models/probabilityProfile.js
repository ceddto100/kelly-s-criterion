const mongoose = require('mongoose');

const probabilityFactorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  value: {
    type: Number,
    required: true
  }
});

const probabilityProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['basketball', 'football', 'baseball', 'hockey', 'soccer']
  },
  factors: [probabilityFactorSchema],
  homeAdvantage: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  baseProbability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Update the updatedAt field before saving
probabilityProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that factors weights sum to 1
probabilityProfileSchema.pre('save', function(next) {
  const totalWeight = this.factors.reduce((sum, factor) => sum + factor.weight, 0);
  if (Math.abs(totalWeight - 1) > 0.0001) {
    next(new Error('Sum of factor weights must equal 1'));
  }
  next();
});

// Validate that only one default profile exists per sport per user
probabilityProfileSchema.pre('save', async function(next) {
  if (this.isDefault) {
    const existingDefault = await this.constructor.findOne({
      userId: this.userId,
      sport: this.sport,
      isDefault: true,
      _id: { $ne: this._id }
    });
    if (existingDefault) {
      next(new Error('Only one default profile can exist per sport per user'));
    }
  }
  next();
});

module.exports = mongoose.model('ProbabilityProfile', probabilityProfileSchema); 