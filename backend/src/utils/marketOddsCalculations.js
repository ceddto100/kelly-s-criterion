/**
 * Utility functions for market odds calculations, conversions, and edge finding
 */

/**
 * Convert American odds to decimal odds
 * @param {number} americanOdds - The American format odds
 * @returns {number} The decimal odds
 */
const americanToDecimal = (americanOdds) => {
  if (americanOdds === 0) return 1;
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
};

/**
 * Convert decimal odds to American odds
 * @param {number} decimalOdds - The decimal format odds
 * @returns {number} The American odds
 */
const decimalToAmerican = (decimalOdds) => {
  if (decimalOdds === 1) return 0;
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
};

/**
 * Convert fractional odds to decimal odds
 * @param {string} fractionalOdds - The fractional odds (e.g. "5/2")
 * @returns {number} The decimal odds
 */
const fractionalToDecimal = (fractionalOdds) => {
  const [numerator, denominator] = fractionalOdds.split('/').map(Number);
  return numerator / denominator + 1;
};

/**
 * Convert decimal odds to fractional odds
 * @param {number} decimalOdds - The decimal format odds
 * @returns {string} The fractional odds
 */
const decimalToFractional = (decimalOdds) => {
  const decimal = decimalOdds - 1;
  
  // Find the best approximation as a fraction
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const precision = 1e-6;
  
  // Use a limited denominator approach
  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestError = Math.abs(decimal - bestNumerator / bestDenominator);
  
  const maxDenominator = 100;
  for (let denominator = 1; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(decimal * denominator);
    const error = Math.abs(decimal - numerator / denominator);
    
    if (error < bestError) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      bestError = error;
      
      if (error < precision) break;
    }
  }
  
  // Simplify the fraction
  const divisor = gcd(bestNumerator, bestDenominator);
  return `${bestNumerator / divisor}/${bestDenominator / divisor}`;
};

/**
 * Convert odds from one format to another
 * @param {number|string} odds - The odds value to convert
 * @param {string} fromFormat - The format of the input odds ('american', 'decimal', 'fractional')
 * @param {string} toFormat - The desired output format ('american', 'decimal', 'fractional')
 * @returns {number|string} The converted odds
 */
const convertOdds = (odds, fromFormat, toFormat) => {
  if (fromFormat === toFormat) return odds;
  
  // First convert to decimal as intermediate format
  let decimalOdds;
  
  switch (fromFormat) {
    case 'american':
      decimalOdds = americanToDecimal(Number(odds));
      break;
    case 'decimal':
      decimalOdds = Number(odds);
      break;
    case 'fractional':
      decimalOdds = fractionalToDecimal(odds);
      break;
    default:
      throw new Error(`Unsupported odds format: ${fromFormat}`);
  }
  
  // Then convert from decimal to target format
  switch (toFormat) {
    case 'american':
      return decimalToAmerican(decimalOdds);
    case 'decimal':
      return decimalOdds;
    case 'fractional':
      return decimalToFractional(decimalOdds);
    default:
      throw new Error(`Unsupported odds format: ${toFormat}`);
  }
};

/**
 * Calculate implied probability from decimal odds
 * @param {number} decimalOdds - The decimal format odds
 * @returns {number} The implied probability (0-1)
 */
const decimalToImpliedProbability = (decimalOdds) => {
  return 1 / decimalOdds;
};

/**
 * Calculate implied probability from any odds format
 * @param {number|string} odds - The odds value
 * @param {string} format - The format of the odds ('american', 'decimal', 'fractional')
 * @returns {number} The implied probability (0-1)
 */
const calculateImpliedProbability = (odds, format) => {
  const decimalOdds = convertOdds(odds, format, 'decimal');
  return decimalToImpliedProbability(decimalOdds);
};

/**
 * Calculate the bookmaker's margin (vig/juice) from a set of odds for all outcomes
 * @param {Array<number>} impliedProbabilities - Array of implied probabilities for all possible outcomes
 * @returns {number} The bookmaker's margin as a decimal (e.g., 0.05 for 5%)
 */
const calculateBookmakerMargin = (impliedProbabilities) => {
  const totalImpliedProbability = impliedProbabilities.reduce((sum, prob) => sum + prob, 0);
  return totalImpliedProbability - 1;
};

/**
 * Calculate true probability by removing bookmaker margin
 * @param {number} impliedProbability - The implied probability from the odds
 * @param {number} margin - The bookmaker's margin
 * @param {number} outcomes - Number of possible outcomes
 * @returns {number} The fair probability
 */
const removeFairMargin = (impliedProbability, margin, outcomes) => {
  // Simple proportional method
  return impliedProbability / (1 + margin);
};

/**
 * Calculate expected value of a bet
 * @param {number} userProbability - User's estimated probability (0-1)
 * @param {number} decimalOdds - Decimal odds offered
 * @returns {number} The expected value percentage
 */
const calculateExpectedValue = (userProbability, decimalOdds) => {
  return userProbability * (decimalOdds - 1) - (1 - userProbability);
};

/**
 * Calculate edge percentage
 * @param {number} userProbability - User's estimated probability (0-1)
 * @param {number} impliedProbability - Market implied probability (0-1)
 * @returns {number} Edge percentage
 */
const calculateEdgePercentage = (userProbability, impliedProbability) => {
  return ((userProbability - impliedProbability) / impliedProbability) * 100;
};

/**
 * Determine if a bet has positive expected value
 * @param {number} userProbability - User's estimated probability (0-1)
 * @param {number} decimalOdds - Decimal odds offered
 * @returns {boolean} True if the bet has positive EV
 */
const isPositiveEV = (userProbability, decimalOdds) => {
  return calculateExpectedValue(userProbability, decimalOdds) > 0;
};

/**
 * Rank betting opportunities by edge
 * @param {Array<Object>} opportunities - Array of betting opportunities
 * @returns {Array<Object>} Sorted array with highest edge first
 */
const rankByEdge = (opportunities) => {
  return [...opportunities].sort((a, b) => b.edgePercentage - a.edgePercentage);
};

module.exports = {
  americanToDecimal,
  decimalToAmerican,
  fractionalToDecimal,
  decimalToFractional,
  convertOdds,
  calculateImpliedProbability,
  calculateBookmakerMargin,
  removeFairMargin,
  calculateExpectedValue,
  calculateEdgePercentage,
  isPositiveEV,
  rankByEdge
}; 