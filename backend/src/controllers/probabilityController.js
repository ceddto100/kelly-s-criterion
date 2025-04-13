const ProbabilityProfile = require('../models/probabilityProfile');
const { calculateEloRating, calculatePoissonProbability, calculateRegressionProbability } = require('../utils/statisticalModels');

// Calculate probability based on profile and factors
const calculateProbability = async (req, res) => {
  try {
    const { sport, factors, isHomeTeam } = req.body;
    
    // Get default profile for the sport
    const defaultProfile = await ProbabilityProfile.findOne({
      userId: req.user._id,
      sport,
      isDefault: true
    });

    if (!defaultProfile) {
      return res.status(404).json({ error: 'No default profile found for this sport' });
    }

    // Calculate base probability using regression model
    const regressionResult = calculateRegressionProbability(factors, sport);
    
    // Calculate Elo probability
    const eloResult = await calculateEloRating(
      factors.teamRating,
      factors.opponentRating,
      sport
    );

    // Calculate Poisson probability if applicable
    let poissonResult = null;
    if (factors.goalsFor && factors.goalsAgainst) {
      poissonResult = calculatePoissonProbability(
        factors.goalsFor,
        factors.goalsAgainst,
        sport
      );
    }

    // Combine probabilities with weights
    const weights = {
      regression: 0.4,
      elo: 0.4,
      poisson: 0.2
    };

    let finalProbability = regressionResult.predictedProbability * weights.regression +
                          eloResult.predictedProbability * weights.elo;

    if (poissonResult) {
      finalProbability += poissonResult.predictedProbability * weights.poisson;
    } else {
      // Adjust weights if Poisson is not available
      const totalWeight = weights.regression + weights.elo;
      finalProbability = finalProbability / totalWeight;
    }

    // Apply home advantage if applicable
    if (isHomeTeam) {
      finalProbability += defaultProfile.homeAdvantage;
    }

    // Ensure probability stays within bounds
    finalProbability = Math.max(0, Math.min(1, finalProbability));

    res.json({
      probability: finalProbability,
      components: {
        regression: regressionResult,
        elo: eloResult,
        poisson: poissonResult
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update probability profile
const saveProfile = async (req, res) => {
  try {
    const { name, sport, factors, homeAdvantage, baseProbability, isDefault } = req.body;
    
    const profileData = {
      userId: req.user._id,
      name,
      sport,
      factors,
      homeAdvantage,
      baseProbability,
      isDefault
    };

    let profile;
    if (req.params.id) {
      profile = await ProbabilityProfile.findByIdAndUpdate(
        req.params.id,
        profileData,
        { new: true }
      );
    } else {
      profile = new ProbabilityProfile(profileData);
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's probability profiles
const getProfiles = async (req, res) => {
  try {
    const profiles = await ProbabilityProfile.find({ userId: req.user._id });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get default profile for a sport
const getDefaultProfile = async (req, res) => {
  try {
    const profile = await ProbabilityProfile.findOne({
      userId: req.user._id,
      sport: req.params.sport,
      isDefault: true
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'No default profile found for this sport' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete probability profile
const deleteProfile = async (req, res) => {
  try {
    await ProbabilityProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  calculateProbability,
  saveProfile,
  getProfiles,
  getDefaultProfile,
  deleteProfile
}; 