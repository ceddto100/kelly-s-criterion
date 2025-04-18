const express = require('express');
const router = express.Router();
const historicalDataController = require('../controllers/historicalDataController');
const { protect } = require('../middleware/authMiddleware');

// Get historical data for a team
router.get('/team', protect, historicalDataController.getTeamHistory);

// Add new historical data
router.post('/', protect, historicalDataController.addHistoricalData);

// Add user prediction to historical data
router.post('/:historicalDataId/predictions', protect, historicalDataController.addPrediction);

// Get prediction accuracy metrics
router.get('/accuracy', protect, historicalDataController.getPredictionAccuracy);

// Get model performance comparison
router.get('/model-performance', protect, historicalDataController.getModelPerformance);

module.exports = router; 