const User = require('../models/userModel');

// Register new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        bankroll: user.bankroll,
        riskSettings: user.riskSettings,
        preferences: user.preferences,
        token: user.generateAuthToken()
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bankroll: user.bankroll,
      riskSettings: user.riskSettings,
      preferences: user.preferences,
      token: user.generateAuthToken()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user profile with performance stats
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update performance stats before sending
    user.updatePerformanceStats();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bankroll: user.bankroll,
      initialBankroll: user.initialBankroll,
      riskSettings: user.riskSettings,
      preferences: user.preferences,
      performance: user.performance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user profile and settings
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    // Update bankroll
    if (req.body.bankroll) {
      user.bankroll = req.body.bankroll;
    }

    // Update risk settings
    if (req.body.riskSettings) {
      Object.assign(user.riskSettings, req.body.riskSettings);
    }

    // Update preferences
    if (req.body.preferences) {
      Object.assign(user.preferences, req.body.preferences);
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bankroll: updatedUser.bankroll,
      riskSettings: updatedUser.riskSettings,
      preferences: updatedUser.preferences,
      performance: updatedUser.performance,
      token: updatedUser.generateAuthToken()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update risk management settings
const updateRiskSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update risk settings
    Object.assign(user.riskSettings, req.body);
    await user.save();

    res.json({
      riskSettings: user.riskSettings
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get performance summary with date range
const getPerformanceSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update current performance stats
    user.updatePerformanceStats();
    await user.save();

    // Calculate bankroll growth
    const bankrollGrowth = user.bankroll - user.initialBankroll;
    const bankrollGrowthPercentage = (bankrollGrowth / user.initialBankroll) * 100;

    res.json({
      currentBankroll: user.bankroll,
      initialBankroll: user.initialBankroll,
      bankrollGrowth,
      bankrollGrowthPercentage,
      performance: user.performance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateRiskSettings,
  getPerformanceSummary
}; 