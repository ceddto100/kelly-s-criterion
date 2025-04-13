const express = require('express');
const router = express.Router();
const factorController = require('../controllers/factorController');
const auth = require('../middleware/auth');

// GET routes
router.get('/sport/:sport', factorController.getFactorsBySport);
router.get('/:id', factorController.getFactorById);
router.get('/analysis/:userId', auth, factorController.getFactorAnalysisHistory);
router.get('/templates/:userId', auth, factorController.getFactorTemplates);

// POST routes
router.post('/', auth, factorController.createFactor);
router.post('/calculate', auth, factorController.calculateProbability);
router.post('/analysis', auth, factorController.saveFactorAnalysis);
router.post('/templates', auth, factorController.saveFactorTemplate);

// PUT routes
router.put('/:id', auth, factorController.updateFactor);
router.put('/weight/:factorId', auth, factorController.setFactorWeight);
router.put('/analysis/:id', auth, factorController.updateAnalysisOutcome);

// DELETE routes
router.delete('/:id', auth, factorController.deleteFactor);

module.exports = router; 