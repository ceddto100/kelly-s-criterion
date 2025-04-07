const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateRiskSettings,
  getPerformanceSummary
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateRiskSettings } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Risk management routes
router.put('/risk-settings', protect, validateRiskSettings, updateRiskSettings);

// Performance tracking routes
router.get('/performance', protect, getPerformanceSummary);

module.exports = router; 