const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/firebaseAuthMiddleware');
const User = require('../models/userModel');

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    // Find or create user in our database based on Firebase auth
    let user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      // Create new user record if not found
      user = new User({
        firebaseUid: req.user.uid,
        email: req.user.email,
        username: req.user.displayName || req.user.email.split('@')[0],
        photoURL: req.user.photoURL,
        lastLogin: new Date()
      });
      
      await user.save();
    } else {
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        username: user.username,
        photoURL: user.photoURL,
        bankroll: user.bankroll || 0,
        initialBankroll: user.initialBankroll || 0,
        riskSettings: user.riskSettings || {},
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const { username, photoURL } = req.body;
    
    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (username) user.username = username;
    if (photoURL) user.photoURL = photoURL;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 