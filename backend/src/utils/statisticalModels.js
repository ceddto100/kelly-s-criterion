// Sport-specific parameters
const SPORT_PARAMS = {
  basketball: {
    kFactor: 32,
    homeAdvantage: 100,
    defaultRating: 1500,
    scoringType: 'points'
  },
  football: {
    kFactor: 24,
    homeAdvantage: 70,
    defaultRating: 1500,
    scoringType: 'goals'
  },
  baseball: {
    kFactor: 20,
    homeAdvantage: 50,
    defaultRating: 1500,
    scoringType: 'runs'
  },
  hockey: {
    kFactor: 28,
    homeAdvantage: 60,
    defaultRating: 1500,
    scoringType: 'goals'
  },
  soccer: {
    kFactor: 24,
    homeAdvantage: 80,
    defaultRating: 1500,
    scoringType: 'goals'
  }
};

// Calculate expected score for Elo rating
const calculateExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

// Calculate new Elo rating after a match
const calculateNewEloRating = (currentRating, expectedScore, actualScore, kFactor) => {
  return currentRating + kFactor * (actualScore - expectedScore);
};

// Calculate Elo rating for a match
const calculateEloRating = async (team, opponent, sport) => {
  try {
    const sportParams = SPORT_PARAMS[sport.toLowerCase()] || SPORT_PARAMS.basketball;
    
    // In a real implementation, you would fetch current ratings from the database
    // For now, we'll use default values
    const teamRating = sportParams.defaultRating;
    const opponentRating = sportParams.defaultRating;
    
    const expectedScore = calculateExpectedScore(
      teamRating + sportParams.homeAdvantage,
      opponentRating
    );
    
    return {
      teamRating,
      opponentRating,
      predictedProbability: expectedScore,
      homeAdvantage: sportParams.homeAdvantage,
      kFactor: sportParams.kFactor,
      sport: sport.toLowerCase()
    };
  } catch (error) {
    throw new Error(`Error calculating Elo rating: ${error.message}`);
  }
};

// Calculate Poisson probability for a given number of goals/points
const calculatePoissonProbability = (goalsFor, goalsAgainst, sport) => {
  const sportParams = SPORT_PARAMS[sport.toLowerCase()] || SPORT_PARAMS.basketball;
  const lambdaFor = goalsFor;
  const lambdaAgainst = goalsAgainst;
  
  // Calculate probability of scoring exactly x goals/points
  const poisson = (x, lambda) => {
    return (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial(x);
  };
  
  // Calculate factorial
  const factorial = (n) => {
    if (n === 0) return 1;
    return n * factorial(n - 1);
  };
  
  // Calculate probability of winning
  let winProbability = 0;
  const maxScore = sportParams.scoringType === 'goals' ? 10 : 20; // Adjust based on sport
  
  for (let i = 0; i < maxScore; i++) {
    for (let j = 0; j < i; j++) {
      winProbability += poisson(i, lambdaFor) * poisson(j, lambdaAgainst);
    }
  }
  
  return {
    predictedProbability: winProbability,
    goalsFor: lambdaFor,
    goalsAgainst: lambdaAgainst,
    sport: sport.toLowerCase(),
    scoringType: sportParams.scoringType
  };
};

// Calculate regression-based probability
const calculateRegressionProbability = (features, sport) => {
  const sportParams = SPORT_PARAMS[sport.toLowerCase()] || SPORT_PARAMS.basketball;
  
  // Sport-specific feature weights
  const weights = {
    homeAdvantage: 0.1,
    recentForm: 0.3,
    headToHead: 0.2,
    restDays: 0.1,
    injuries: 0.1,
    weather: 0.1,
    venue: 0.1
  };
  
  // Adjust weights based on sport
  if (sport.toLowerCase() === 'baseball') {
    weights.weather = 0.15; // Weather has more impact in baseball
    weights.homeAdvantage = 0.08; // Less home advantage in baseball
  } else if (sport.toLowerCase() === 'soccer') {
    weights.homeAdvantage = 0.15; // More home advantage in soccer
    weights.venue = 0.15; // Venue has more impact in soccer
  }
  
  let probability = 0.5; // Base probability
  
  // Apply weights to features
  Object.keys(features).forEach(feature => {
    if (weights[feature]) {
      probability += weights[feature] * features[feature];
    }
  });
  
  // Ensure probability is between 0 and 1
  probability = Math.max(0, Math.min(1, probability));
  
  return {
    predictedProbability: probability,
    featureWeights: weights,
    sport: sport.toLowerCase()
  };
};

module.exports = {
  calculateEloRating,
  calculatePoissonProbability,
  calculateRegressionProbability,
  SPORT_PARAMS
}; 