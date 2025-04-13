const Factor = require('../models/Factor');
const FactorAnalysis = require('../models/factorModel').FactorAnalysis;
const FactorTemplate = require('../models/FactorTemplate');
const { processFactor, generateCorrelationMatrix } = require('../utils/factorCalculations');
const mongoose = require('mongoose');

/**
 * Get all available factors for a specific sport
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFactorsBySport = async (req, res) => {
  try {
    const { sport } = req.params;
    const factors = await Factor.find({ sport, isActive: true }).sort({ category: 1, name: 1 });
    res.status(200).json(factors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching factors', error: error.message });
  }
};

/**
 * Get a specific factor by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFactorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid factor ID' });
    }
    
    const factor = await Factor.findById(id);
    
    if (!factor) {
      return res.status(404).json({ message: 'Factor not found' });
    }
    
    res.status(200).json(factor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching factor', error: error.message });
  }
};

/**
 * Create a new factor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFactor = async (req, res) => {
  try {
    const { name, key, description, sport, category, dataType, defaultWeight, metadata } = req.body;
    
    // Check if factor with the same key already exists for the sport
    const existingFactor = await Factor.findOne({ key, sport });
    if (existingFactor) {
      return res.status(400).json({ message: 'A factor with this key already exists for this sport' });
    }
    
    const newFactor = new Factor({
      name,
      key,
      description,
      sport,
      category,
      dataType,
      defaultWeight,
      isActive: true,
      metadata
    });
    
    const savedFactor = await newFactor.save();
    res.status(201).json(savedFactor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating factor', error: error.message });
  }
};

/**
 * Update an existing factor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFactor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid factor ID' });
    }
    
    const factor = await Factor.findById(id);
    
    if (!factor) {
      return res.status(404).json({ message: 'Factor not found' });
    }
    
    // If key or sport is being changed, check for existing factors
    if ((updates.key && updates.key !== factor.key) || 
        (updates.sport && updates.sport !== factor.sport)) {
      const existingFactor = await Factor.findOne({ 
        key: updates.key || factor.key, 
        sport: updates.sport || factor.sport,
        _id: { $ne: id }
      });
      
      if (existingFactor) {
        return res.status(400).json({ 
          message: 'A factor with this key already exists for this sport' 
        });
      }
    }
    
    const updatedFactor = await Factor.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedFactor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating factor', error: error.message });
  }
};

/**
 * Delete a factor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFactor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid factor ID' });
    }
    
    const factor = await Factor.findById(id);
    
    if (!factor) {
      return res.status(404).json({ message: 'Factor not found' });
    }
    
    // Check if factor is used in any templates
    const templatesUsingFactor = await FactorTemplate.find({
      'factorWeights.factor': id
    });
    
    if (templatesUsingFactor.length > 0) {
      // Just deactivate the factor instead of deleting
      const updatedFactor = await Factor.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      
      return res.status(200).json({
        message: 'Factor deactivated as it is being used in templates',
        factor: updatedFactor
      });
    }
    
    await Factor.findByIdAndDelete(id);
    res.status(200).json({ message: 'Factor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting factor', error: error.message });
  }
};

/**
 * Set user-specific weight for a factor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setFactorWeight = async (req, res) => {
  try {
    const { factorId } = req.params;
    const { weight, userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(factorId)) {
      return res.status(400).json({ message: 'Invalid factor ID' });
    }
    
    if (weight === undefined || weight < 0 || weight > 10) {
      return res.status(400).json({ message: 'Weight must be a number between 0 and 10' });
    }
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find factor
    const factor = await Factor.findById(factorId);
    
    if (!factor) {
      return res.status(404).json({ message: 'Factor not found' });
    }
    
    // Set user weight
    factor.setUserWeight(userId, weight);
    await factor.save();
    
    res.status(200).json({
      success: true,
      message: 'Factor weight updated successfully',
      data: {
        factorId,
        userId,
        weight
      }
    });
  } catch (error) {
    console.error('Error setting factor weight:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error setting factor weight', 
      error: error.message 
    });
  }
};

/**
 * Calculate probability based on provided factors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateProbability = async (req, res) => {
  try {
    const { sport, factors, userId } = req.body;
    
    if (!sport || !factors || !Array.isArray(factors) || factors.length === 0) {
      return res.status(400).json({ 
        message: 'Valid sport and factors array are required' 
      });
    }
    
    // Get factor definitions for this sport
    const factorDefinitions = await Factor.findBySport(sport);
    
    if (!factorDefinitions || factorDefinitions.length === 0) {
      return res.status(404).json({ 
        message: 'No factors found for this sport' 
      });
    }
    
    // Generate correlation matrix
    const correlationMatrix = generateCorrelationMatrix(factorDefinitions);
    
    // Process factors and calculate probability
    const result = processFactor(factors, factorDefinitions, correlationMatrix);
    
    // Return probability result
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating probability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating probability', 
      error: error.message 
    });
  }
};

/**
 * Save a factor analysis result
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveFactorAnalysis = async (req, res) => {
  try {
    const {
      userId,
      event,
      sport,
      factors,
      probability,
      confidence,
      confidenceInterval,
      notes
    } = req.body;
    
    if (!userId || !event || !sport || !factors || factors.length === 0) {
      return res.status(400).json({ 
        message: 'UserId, event, sport, and factors are required' 
      });
    }
    
    // Create new analysis record
    const analysis = new FactorAnalysis({
      userId,
      event,
      sport,
      factors,
      probability,
      confidence,
      confidenceInterval,
      notes,
      createdAt: new Date()
    });
    
    await analysis.save();
    
    res.status(201).json({
      success: true,
      message: 'Factor analysis saved successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Error saving factor analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving factor analysis', 
      error: error.message 
    });
  }
};

/**
 * Get factor analysis history for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFactorAnalysisHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport, limit = 10, page = 1 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Build query
    const query = { userId };
    if (sport) {
      query.sport = sport;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get analysis records
    const analyses = await FactorAnalysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await FactorAnalysis.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting factor analysis history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving factor analysis history', 
      error: error.message 
    });
  }
};

/**
 * Save factor template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveFactorTemplate = async (req, res) => {
  try {
    const { userId, name, description, sport, factors } = req.body;
    
    if (!userId || !name || !sport || !factors || factors.length === 0) {
      return res.status(400).json({ 
        message: 'UserId, name, sport, and factors are required' 
      });
    }
    
    // Create new template
    const template = new FactorTemplate({
      userId,
      name,
      description,
      sport,
      factors,
      createdAt: new Date()
    });
    
    await template.save();
    
    res.status(201).json({
      success: true,
      message: 'Factor template saved successfully',
      data: template
    });
  } catch (error) {
    console.error('Error saving factor template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving factor template', 
      error: error.message 
    });
  }
};

/**
 * Get user's factor templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFactorTemplates = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Build query
    const query = { userId };
    if (sport) {
      query.sport = sport;
    }
    
    // Get templates
    const templates = await FactorTemplate.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting factor templates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving factor templates', 
      error: error.message 
    });
  }
};

/**
 * Update actual outcome for a factor analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAnalysisOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualOutcome, notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid analysis ID' });
    }
    
    if (actualOutcome === undefined) {
      return res.status(400).json({ message: 'Actual outcome is required' });
    }
    
    // Find analysis
    const analysis = await FactorAnalysis.findById(id);
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    // Update outcome
    analysis.actualOutcome = actualOutcome;
    if (notes) {
      analysis.notes = notes;
    }
    analysis.updatedAt = new Date();
    
    await analysis.save();
    
    res.status(200).json({
      success: true,
      message: 'Analysis outcome updated successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Error updating analysis outcome:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating analysis outcome', 
      error: error.message 
    });
  }
};

module.exports = {
  getFactorsBySport,
  getFactorById,
  createFactor,
  updateFactor,
  deleteFactor,
  setFactorWeight,
  calculateProbability,
  saveFactorAnalysis,
  getFactorAnalysisHistory,
  saveFactorTemplate,
  getFactorTemplates,
  updateAnalysisOutcome
}; 