const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FactorTemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
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
  factorWeights: [{
    factor: {
      type: Schema.Types.ObjectId,
      ref: 'Factor',
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    }
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    useCount: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Indexes for faster queries
FactorTemplateSchema.index({ user: 1, sport: 1 });
FactorTemplateSchema.index({ sport: 1, isPublic: 1 });

const FactorTemplate = mongoose.model('FactorTemplate', FactorTemplateSchema);

module.exports = FactorTemplate; 