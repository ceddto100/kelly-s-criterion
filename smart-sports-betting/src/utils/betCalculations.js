/**
 * Utility functions for bet calculations
 */

/**
 * Convert American odds to decimal odds
 * @param {number} americanOdds - American odds (e.g. +150, -110)
 * @returns {number} - Decimal odds (e.g. 2.5, 1.91)
 */
export const americanToDecimal = (americanOdds) => {
  if (americanOdds > 0) {
    return 1 + (americanOdds / 100);
  } else {
    return 1 + (100 / Math.abs(americanOdds));
  }
};

/**
 * Convert decimal odds to American odds
 * @param {number} decimalOdds - Decimal odds (e.g. 2.5, 1.91)
 * @returns {number} - American odds (e.g. +150, -110)
 */
export const decimalToAmerican = (decimalOdds) => {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
};

/**
 * Calculate the implied probability from decimal odds
 * @param {number} decimalOdds - Decimal odds (e.g. 2.5, 1.91)
 * @returns {number} - Implied probability (0 to 1)
 */
export const oddsToImpliedProbability = (decimalOdds) => {
  return 1 / decimalOdds;
};

/**
 * Calculate the Kelly Criterion bet size
 * @param {number} probability - Estimated probability of winning (0 to 1)
 * @param {number} americanOdds - American odds (e.g. +150, -110)
 * @returns {number} - Kelly percentage (0 to 1)
 */
export const calculateKelly = (probability, americanOdds) => {
  const decimalOdds = americanToDecimal(americanOdds);
  const impliedProbability = oddsToImpliedProbability(decimalOdds);
  
  // Edge calculation
  const edge = probability - impliedProbability;
  
  // Kelly formula: (bp - q) / b
  // where b = decimal odds - 1, p = probability of winning, q = probability of losing
  const b = decimalOdds - 1; // The profit per unit wagered if you win
  const q = 1 - probability; // Probability of losing
  
  const kellyPercentage = (b * probability - q) / b;
  
  // Return 0 if Kelly is negative (no edge)
  return Math.max(0, kellyPercentage);
};

/**
 * Calculate full Kelly bet amount
 * @param {number} kellyPercentage - Kelly percentage (0 to 1)
 * @param {number} bankroll - Total bankroll amount
 * @returns {number} - Bet amount
 */
export const calculateKellyBet = (kellyPercentage, bankroll) => {
  return kellyPercentage * bankroll;
};

/**
 * Calculate expected value of a bet
 * @param {number} probability - Estimated probability of winning (0 to 1)
 * @param {number} americanOdds - American odds (e.g. +150, -110)
 * @returns {number} - Expected value percentage
 */
export const calculateExpectedValue = (probability, americanOdds) => {
  const decimalOdds = americanToDecimal(americanOdds);
  const winProfit = decimalOdds - 1; // Profit if you win (per unit wagered)
  const lossProbability = 1 - probability; // Probability of losing
  
  // EV = (probability * profit) - (loss probability * stake)
  return (probability * winProfit) - lossProbability;
};

/**
 * Analyze a bet and return Kelly criterion and other metrics
 * @param {Object} betData - Bet data
 * @param {number} betData.probability - Estimated probability of winning (0 to 1)
 * @param {number} betData.odds - American odds (e.g. +150, -110)
 * @param {number} betData.bankroll - Total bankroll amount
 * @returns {Object} - Analysis results
 */
export const analyzeBet = (betData) => {
  const { probability, odds, bankroll, sport, betType } = betData;
  
  const kellyPercentage = calculateKelly(probability, odds);
  const kellyBet = calculateKellyBet(kellyPercentage, bankroll);
  const expectedValue = calculateExpectedValue(probability, odds);
  const decimalOdds = americanToDecimal(odds);
  const impliedProbability = oddsToImpliedProbability(decimalOdds);
  
  return {
    ...betData,
    kellyPercentage,
    kellyBet,
    expectedValue,
    decimalOdds,
    impliedProbability
  };
};

/**
 * Calculates optimal bet sizing using the Kelly Criterion formula
 * with confidence level adjustment
 * @param {Object} params - Calculation parameters
 * @param {number} params.probability - Estimated win probability (0-1)
 * @param {string|number} params.odds - Odds value (can be American format like +150, -110 or decimal format like 2.5)
 * @param {string} params.oddsFormat - Format of the odds ('american' or 'decimal')
 * @param {number} params.confidenceLevel - User confidence level (1-5)
 * @returns {Object} Kelly calculation results
 */
export const calculateKellyWithConfidence = ({ probability, odds, oddsFormat, confidenceLevel = 3 }) => {
  // Ensure probability is between 0 and 1
  const prob = Math.min(Math.max(probability, 0.01), 0.99);
  
  // Convert odds to decimal format if needed
  let decimalOdds;
  if (oddsFormat === 'american') {
    // Convert American odds to decimal
    if (parseFloat(odds) > 0) {
      decimalOdds = (parseFloat(odds) / 100) + 1;
    } else {
      decimalOdds = (100 / Math.abs(parseFloat(odds))) + 1;
    }
  } else if (oddsFormat === 'fractional') {
    // Convert fractional odds to decimal
    const parts = odds.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      decimalOdds = (numerator / denominator) + 1;
    } else {
      decimalOdds = parseFloat(odds);
    }
  } else {
    // Already decimal format
    decimalOdds = parseFloat(odds);
  }
  
  // Calculate implied probability from odds
  const impliedProbability = 1 / decimalOdds;
  
  // Calculate edge (difference between your estimated probability and implied probability)
  const edge = ((prob - impliedProbability) / impliedProbability) * 100;
  
  // Calculate Kelly percentage
  const netOdds = decimalOdds - 1;
  const kellyPercentage = ((prob * netOdds) - (1 - prob)) / netOdds;
  
  // Adjust Kelly based on confidence level (1-5 scale)
  // Confidence level 3 is neutral, higher means more confident
  const confidenceMultiplier = confidenceLevel / 3;
  const recommendedSize = Math.max(0, kellyPercentage * 100 * confidenceMultiplier);
  
  // Determine risk level
  let riskLevel = 'Medium';
  if (recommendedSize > 5) {
    riskLevel = 'High';
  } else if (recommendedSize < 2) {
    riskLevel = 'Low';
  }
  
  return {
    edge: parseFloat(edge.toFixed(2)),
    recommendedSize: parseFloat(recommendedSize.toFixed(2)),
    riskLevel,
    expectedValue: parseFloat((prob * netOdds * 100 - (1 - prob) * 100).toFixed(2)),
    breakEvenProb: parseFloat((impliedProbability * 100).toFixed(2)),
  };
}; 