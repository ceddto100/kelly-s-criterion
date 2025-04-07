/**
 * Convert various odds formats and calculate probabilities
 */
const oddsCalculations = {
  // Convert American odds to decimal
  americanToDecimal: (americanOdds) => {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    }
    return (100 / Math.abs(americanOdds)) + 1;
  },

  // Convert decimal odds to probability
  decimalToImpliedProbability: (decimalOdds) => {
    return 1 / decimalOdds;
  },

  // Calculate edge based on user's estimated probability vs. market implied probability
  calculateEdge: (userProbability, marketOdds) => {
    const decimalOdds = typeof marketOdds === 'number' ? 
      marketOdds : 
      oddsCalculations.americanToDecimal(marketOdds);
    const impliedProbability = oddsCalculations.decimalToImpliedProbability(decimalOdds);
    return userProbability - impliedProbability;
  }
};

/**
 * Calculate Kelly Criterion optimal bet size
 * @param {number} probability - User's estimated probability of winning (0-1)
 * @param {number} odds - Decimal odds or American odds
 * @param {number} fractionMultiplier - Fraction of Kelly to use (0-1)
 * @param {number} maxBetPercentage - Maximum bet size as percentage of bankroll (0-1)
 * @returns {Object} Bet size calculations and analysis
 */
const calculateKellyBet = (probability, odds, fractionMultiplier = 1, maxBetPercentage = 0.25) => {
  // Convert odds to decimal if American odds provided
  const decimalOdds = typeof odds === 'number' ? 
    odds : 
    oddsCalculations.americanToDecimal(odds);

  // Calculate edge
  const impliedProbability = oddsCalculations.decimalToImpliedProbability(decimalOdds);
  const edge = oddsCalculations.calculateEdge(probability, decimalOdds);

  // Kelly formula: f* = (bp - q)/b
  // where: b = odds - 1, p = probability of win, q = probability of loss
  const b = decimalOdds - 1;
  const q = 1 - probability;
  let kellyFraction = (b * probability - q) / b;

  // Apply fractional Kelly and maximum bet constraint
  kellyFraction = Math.min(
    kellyFraction * fractionMultiplier,
    maxBetPercentage
  );

  // Ensure non-negative bet size
  kellyFraction = Math.max(0, kellyFraction);

  return {
    kellyFraction,
    edge,
    impliedProbability,
    decimalOdds,
    analysis: {
      hasBettingValue: edge > 0,
      confidence: probability,
      riskLevel: kellyFraction > 0.1 ? 'high' : kellyFraction > 0.05 ? 'medium' : 'low',
      recommendation: kellyFraction === 0 ? 'no bet' : 'bet'
    }
  };
};

/**
 * Calculate potential returns and risk metrics
 * @param {number} betAmount - Amount being wagered
 * @param {number} odds - Decimal odds or American odds
 * @param {number} bankroll - Current bankroll
 * @returns {Object} Risk and return calculations
 */
const calculateRiskMetrics = (betAmount, odds, bankroll) => {
  const decimalOdds = typeof odds === 'number' ? 
    odds : 
    oddsCalculations.americanToDecimal(odds);

  const potentialProfit = betAmount * (decimalOdds - 1);
  const riskToRewardRatio = betAmount / potentialProfit;
  const bankrollRiskPercentage = (betAmount / bankroll) * 100;

  return {
    potentialProfit,
    riskToRewardRatio,
    bankrollRiskPercentage,
    maxLoss: betAmount
  };
};

module.exports = {
  oddsCalculations,
  calculateKellyBet,
  calculateRiskMetrics
}; 