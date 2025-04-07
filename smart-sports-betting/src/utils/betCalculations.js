/**
 * Calculates optimal bet sizing using the Kelly Criterion formula
 * @param {Object} params - Calculation parameters
 * @param {number} params.probability - Estimated win probability (0-1)
 * @param {string|number} params.odds - Odds value (can be American format like +150, -110 or decimal format like 2.5)
 * @param {string} params.oddsFormat - Format of the odds ('american' or 'decimal')
 * @param {number} params.confidenceLevel - User confidence level (1-5)
 * @returns {Object} Kelly calculation results
 */
export const calculateKelly = ({ probability, odds, oddsFormat, confidenceLevel = 3 }) => {
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