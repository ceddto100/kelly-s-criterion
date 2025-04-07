const { oddsCalculations } = require('../utils/kellyCalculations');

// Validate bet creation data
const validateBetCreation = (req, res, next) => {
  const {
    sport,
    event,
    eventDate,
    betType,
    odds,
    userProbability,
    stake,
    confidenceLevel,
    unitSize
  } = req.body;

  const errors = [];

  // Required fields
  if (!sport) errors.push('Sport is required');
  if (!event) errors.push('Event is required');
  if (!eventDate) errors.push('Event date is required');
  if (!betType) errors.push('Bet type is required');
  if (!odds) errors.push('Odds are required');
  if (!userProbability) errors.push('Win probability is required');
  if (!stake) errors.push('Stake amount is required');
  if (!confidenceLevel) errors.push('Confidence level is required');

  // Validate probability
  if (userProbability < 0.01 || userProbability > 0.99) {
    errors.push('Win probability must be between 0.01 and 0.99');
  }

  // Validate odds format
  try {
    const decimalOdds = typeof odds === 'number' ? 
      odds : 
      oddsCalculations.americanToDecimal(odds);
    
    if (decimalOdds <= 1) {
      errors.push('Invalid odds value');
    }
  } catch (error) {
    errors.push('Invalid odds format');
  }

  // Validate confidence level
  if (confidenceLevel < 1 || confidenceLevel > 10) {
    errors.push('Confidence level must be between 1 and 10');
  }

  // Validate unit size if provided
  if (unitSize && (unitSize < 1 || unitSize > 5)) {
    errors.push('Unit size must be between 1 and 5');
  }

  // Validate event date
  const eventDateObj = new Date(eventDate);
  if (isNaN(eventDateObj.getTime())) {
    errors.push('Invalid event date');
  } else if (eventDateObj < new Date()) {
    errors.push('Event date cannot be in the past');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};

// Validate bet update data
const validateBetUpdate = (req, res, next) => {
  const { status, result } = req.body;
  const errors = [];

  // Validate status
  const validStatuses = ['pending', 'won', 'lost', 'push', 'cancelled'];
  if (!validStatuses.includes(status)) {
    errors.push('Invalid bet status');
  }

  // Validate result if provided
  if (result !== undefined && typeof result !== 'number') {
    errors.push('Result must be a number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};

// Validate risk settings update
const validateRiskSettings = (req, res, next) => {
  const {
    defaultFractionMultiplier,
    maxBetPercentage,
    stopLossPercentage,
    stopWinPercentage,
    maxOpenBets,
    maxConsecutiveLosses
  } = req.body;

  const errors = [];

  // Validate fractional Kelly multiplier
  if (defaultFractionMultiplier !== undefined) {
    if (defaultFractionMultiplier < 0 || defaultFractionMultiplier > 1) {
      errors.push('Fractional Kelly multiplier must be between 0 and 1');
    }
  }

  // Validate max bet percentage
  if (maxBetPercentage !== undefined) {
    if (maxBetPercentage < 0 || maxBetPercentage > 1) {
      errors.push('Maximum bet percentage must be between 0 and 1');
    }
  }

  // Validate stop loss percentage
  if (stopLossPercentage !== undefined) {
    if (stopLossPercentage < 0 || stopLossPercentage > 1) {
      errors.push('Stop loss percentage must be between 0 and 1');
    }
  }

  // Validate stop win percentage
  if (stopWinPercentage !== undefined) {
    if (stopWinPercentage < 0) {
      errors.push('Stop win percentage cannot be negative');
    }
  }

  // Validate max open bets
  if (maxOpenBets !== undefined) {
    if (!Number.isInteger(maxOpenBets) || maxOpenBets < 1) {
      errors.push('Maximum open bets must be a positive integer');
    }
  }

  // Validate max consecutive losses
  if (maxConsecutiveLosses !== undefined) {
    if (!Number.isInteger(maxConsecutiveLosses) || maxConsecutiveLosses < 1) {
      errors.push('Maximum consecutive losses must be a positive integer');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};

module.exports = {
  validateBetCreation,
  validateBetUpdate,
  validateRiskSettings
}; 