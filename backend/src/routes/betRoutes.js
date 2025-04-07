const express = require('express');
const router = express.Router();
const {
  createBet,
  getBets,
  getBet,
  updateBetResult,
  getBetStats
} = require('../controllers/betController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateBetCreation,
  validateBetUpdate
} = require('../middleware/validationMiddleware');

// All routes are protected
router.use(protect);

// Main bet routes
router.route('/')
  .post(validateBetCreation, createBet)
  .get(getBets);

// Statistics and analytics
router.get('/stats', getBetStats);

// Individual bet management
router.route('/:id')
  .get(getBet)
  .put(validateBetUpdate, updateBetResult);

module.exports = router; 