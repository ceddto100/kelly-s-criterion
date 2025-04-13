const express = require('express');
const router = express.Router();
const regressionController = require('../controllers/regressionController');

// POST route for calculating regression adjustment
router.post('/calculate', regressionController.calculateRegression);

// GET route for retrieving regression factors for a specific sport
router.get('/factors/:sport', regressionController.getRegressionFactors);

// GET route for retrieving team metrics
router.get('/team/:teamId/:sport/:season?', regressionController.getTeamMetrics);

// POST route for updating team metrics
router.post('/team/update', regressionController.updateTeamMetric);

// GET route for retrieving historical performance data
router.get('/history/:teamId/:sport/:metric', regressionController.getHistoricalData);

module.exports = router; 