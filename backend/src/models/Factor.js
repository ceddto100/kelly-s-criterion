const mongoose = require('mongoose');

const FactorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['basketball', 'football', 'baseball', 'hockey', 'soccer']
  },
  category: {
    type: String,
    required: true,
    enum: ['offensive', 'defensive', 'situational', 'momentum', 'historical', 'miscellaneous']
  },
  dataType: {
    type: String,
    required: true,
    enum: ['percentage', 'integer', 'decimal', 'boolean', 'rating']
  },
  defaultWeight: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    source: String,
    updateFrequency: String,
    lastUpdated: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
FactorSchema.index({ sport: 1, category: 1 });
FactorSchema.index({ key: 1 }, { unique: true });

const Factor = mongoose.model('Factor', FactorSchema);

module.exports = Factor; 