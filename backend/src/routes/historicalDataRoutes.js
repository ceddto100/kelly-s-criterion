const express = require('express');
const router = express.Router();
const historicalDataController = require('../controllers/historicalDataController');
const { authenticate } = require('../middleware/authMiddleware');

// Get historical data for a team
router.get('/team', authenticate, historicalDataController.getTeamHistory);

// Add new historical data
router.post('/', authenticate, historicalDataController.addHistoricalData);

// Add user prediction to historical data
router.post('/:historicalDataId/predictions', authenticate, historicalDataController.addPrediction);

// Get prediction accuracy metrics
router.get('/accuracy', authenticate, historicalDataController.getPredictionAccuracy);

// Get model performance comparison
router.get('/model-performance', authenticate, historicalDataController.getModelPerformance);

module.exports = router; 