/**
 * Utility functions for market odds comparison
 */

/**
 * Format a decimal probability as a percentage string
 * @param {number} probability - Decimal probability (0-1)
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted percentage
 */
export const formatProbabilityAsPercentage = (probability, decimals = 1) => {
  if (probability === null || probability === undefined) return 'N/A';
  return `${(probability * 100).toFixed(decimals)}%`;
};

/**
 * Format odds in the user's preferred format
 * @param {number} decimalOdds - Odds in decimal format
 * @param {string} format - Desired format ('american', 'decimal', 'fractional')
 * @returns {string} Formatted odds string
 */
export const formatOdds = (decimalOdds, format = 'decimal') => {
  if (!decimalOdds) return 'N/A';
  
  switch (format) {
    case 'american':
      // Convert decimal to American
      if (decimalOdds === 1) return '0';
      if (decimalOdds >= 2) {
        return `+${Math.round((decimalOdds - 1) * 100)}`;
      } else {
        return Math.round(-100 / (decimalOdds - 1)).toString();
      }
    
    case 'fractional':
      // Convert decimal to fractional
      const decimal = decimalOdds - 1;
      
      // Find GCD for fraction simplification
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      
      // Use limited denominator approach for approximation
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
          
          if (error < 1e-6) break;
        }
      }
      
      // Simplify the fraction
      const divisor = gcd(bestNumerator, bestDenominator);
      return `${bestNumerator / divisor}/${bestDenominator / divisor}`;
      
    case 'decimal':
    default:
      // Return decimal odds with 2 decimal places
      return decimalOdds.toFixed(2);
  }
};

/**
 * Calculate Kelly bet size
 * @param {number} probability - User's estimated probability (0-1)
 * @param {number} decimalOdds - Decimal odds offered
 * @param {number} bankroll - Current bankroll amount
 * @param {string} fraction - Kelly fraction ('full', 'half', 'quarter')
 * @returns {number} Recommended bet size
 */
export const calculateKellyBetSize = (probability, decimalOdds, bankroll, fraction = 'half') => {
  const netOdds = decimalOdds - 1; // Convert to net odds
  const q = 1 - probability; // Probability of losing
  
  // Calculate full Kelly
  let kellyPercentage = (probability * netOdds - q) / netOdds;
  
  // Apply fraction if needed
  switch (fraction) {
    case 'half':
      kellyPercentage /= 2;
      break;
    case 'quarter':
      kellyPercentage /= 4;
      break;
    // Default is full Kelly
  }
  
  // Ensure Kelly is never negative and never more than full bankroll
  kellyPercentage = Math.max(0, Math.min(1, kellyPercentage));
  
  return kellyPercentage * bankroll;
};

/**
 * Format expected value as a readable string
 * @param {number} ev - Expected value as a decimal
 * @returns {string} Formatted EV with sign
 */
export const formatExpectedValue = (ev) => {
  if (ev === null || ev === undefined) return 'N/A';
  const sign = ev > 0 ? '+' : '';
  return `${sign}${(ev * 100).toFixed(2)}%`;
};

/**
 * Format edge percentage as a readable string
 * @param {number} edge - Edge percentage
 * @returns {string} Formatted edge with sign
 */
export const formatEdge = (edge) => {
  if (edge === null || edge === undefined) return 'N/A';
  const sign = edge > 0 ? '+' : '';
  return `${sign}${edge.toFixed(2)}%`;
};

/**
 * Determine edge quality category
 * @param {number} edgePercentage - Edge percentage
 * @returns {string} Edge category ('strong', 'moderate', 'weak', 'negative')
 */
export const getEdgeCategory = (edgePercentage) => {
  if (edgePercentage > 10) return 'strong';
  if (edgePercentage > 5) return 'moderate';
  if (edgePercentage > 0) return 'weak';
  return 'negative';
};

/**
 * Get color for displaying edge values
 * @param {number} value - The edge value
 * @returns {string} CSS color value
 */
export const getEdgeColor = (value) => {
  if (value > 10) return 'var(--color-success-600)';
  if (value > 5) return 'var(--color-success-500)';
  if (value > 0) return 'var(--color-success-400)';
  if (value > -5) return 'var(--color-warning-500)';
  return 'var(--color-error-500)';
};

/**
 * Calculate betting threshold based on odds and vig
 * @param {number} impliedProbability - Market implied probability
 * @param {number} margin - Estimated bookmaker margin
 * @param {number} requiredEdge - Minimum edge required (default 3%)
 * @returns {number} Minimum probability needed for a positive expected value bet
 */
export const calculateBettingThreshold = (impliedProbability, margin, requiredEdge = 0.03) => {
  // Adjust for margin
  const fairProbability = impliedProbability / (1 + margin);
  
  // Apply required edge
  return fairProbability * (1 + requiredEdge);
};

/**
 * Extract bookmaker name from a display string
 * @param {string} fullName - Full bookmaker name (may include region)
 * @returns {string} Shortened bookmaker name
 */
export const getShortBookmakerName = (fullName) => {
  // Remove region suffixes
  const nameParts = fullName.split(' ');
  if (nameParts.length <= 2) return fullName;
  
  // Return first two parts
  return nameParts.slice(0, 2).join(' ');
}; 