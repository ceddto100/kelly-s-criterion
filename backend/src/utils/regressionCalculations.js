/**
 * Utility functions for regression to the mean calculations
 */

/**
 * Calculate the expected regression to the mean for a performance metric
 * 
 * @param {number} currentPerformance - Current performance level
 * @param {number} baseline - Long-term average or true talent level
 * @param {number} regressionFactor - Sport/metric specific regression factor (0-1)
 * @returns {number} - Expected performance after regression
 */
const calculateRegression = (currentPerformance, baseline, regressionFactor) => {
  // The regression formula: Expected = Baseline + (Current - Baseline) * (1 - RegressionFactor)
  return baseline + (currentPerformance - baseline) * (1 - regressionFactor);
};

/**
 * Calculate confidence interval for the regression estimate
 * 
 * @param {number} expectedValue - Regression-adjusted expected value
 * @param {number} standardDeviation - Standard deviation of the performance metric
 * @param {number} sampleSize - Number of observations in the sample
 * @param {number} confidenceLevel - Desired confidence level (default: 0.95 for 95%)
 * @returns {Object} - Lower and upper bounds of the confidence interval
 */
const calculateConfidenceInterval = (expectedValue, standardDeviation, sampleSize, confidenceLevel = 0.95) => {
  // Z-score for common confidence levels
  const zScores = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  const zScore = zScores[confidenceLevel] || 1.96;
  const standardError = standardDeviation / Math.sqrt(sampleSize);
  const marginOfError = zScore * standardError;
  
  return {
    lower: expectedValue - marginOfError,
    upper: expectedValue + marginOfError
  };
};

/**
 * Calculate the reliability of a metric based on sample size
 * 
 * @param {number} sampleSize - Number of observations
 * @param {number} stabilizationPoint - Sample size at which the metric becomes 50% reliable
 * @returns {number} - Reliability coefficient (0-1)
 */
const calculateReliability = (sampleSize, stabilizationPoint) => {
  // Reliability calculation using the formula: sampleSize / (sampleSize + stabilizationPoint)
  // This represents how much to weigh the observed data vs. the baseline
  return sampleSize / (sampleSize + stabilizationPoint);
};

/**
 * Calculate true talent level by combining observed performance with population mean
 * 
 * @param {number} observedPerformance - Current observed performance
 * @param {number} populationMean - Average performance across the population
 * @param {number} reliability - Reliability coefficient (0-1)
 * @returns {number} - Estimated true talent level
 */
const estimateTrueTalent = (observedPerformance, populationMean, reliability) => {
  // Weighted average based on reliability
  return (observedPerformance * reliability) + (populationMean * (1 - reliability));
};

/**
 * Get the appropriate regression factor for a specific sport and metric
 * 
 * @param {string} sport - Sport name (e.g., 'basketball', 'baseball')
 * @param {string} metric - Performance metric (e.g., 'threePointPercentage', 'battingAverage')
 * @returns {Object} - Regression factor and stabilization point for the metric
 */
const getSportSpecificRegressionFactors = (sport, metric) => {
  // These values are based on statistical research on various sports metrics
  // and how quickly they stabilize (higher values mean more regression expected)
  const factors = {
    basketball: {
      threePointPercentage: { factor: 0.70, stabilizationPoint: 750 }, // 750 attempts
      freeThrowPercentage: { factor: 0.55, stabilizationPoint: 250 },  // 250 attempts
      fieldGoalPercentage: { factor: 0.60, stabilizationPoint: 400 },  // 400 attempts
      winPercentage: { factor: 0.65, stabilizationPoint: 70 },         // 70 games
      pointsPerGame: { factor: 0.40, stabilizationPoint: 20 },         // 20 games
      assistsPerGame: { factor: 0.30, stabilizationPoint: 15 }         // 15 games
    },
    baseball: {
      battingAverage: { factor: 0.80, stabilizationPoint: 500 },       // 500 at-bats
      onBasePercentage: { factor: 0.65, stabilizationPoint: 350 },     // 350 plate appearances
      sluggingPercentage: { factor: 0.75, stabilizationPoint: 450 },   // 450 at-bats
      era: { factor: 0.70, stabilizationPoint: 500 },                  // 500 batters faced
      winPercentage: { factor: 0.85, stabilizationPoint: 100 }         // 100 games
    },
    football: {
      passCompletionPercentage: { factor: 0.65, stabilizationPoint: 300 }, // 300 attempts
      yardsPerAttempt: { factor: 0.75, stabilizationPoint: 400 },          // 400 attempts
      winPercentage: { factor: 0.80, stabilizationPoint: 48 },             // 48 games
      fieldGoalPercentage: { factor: 0.70, stabilizationPoint: 100 }       // 100 attempts
    },
    soccer: {
      scoringRate: { factor: 0.78, stabilizationPoint: 40 },          // 40 matches
      winPercentage: { factor: 0.75, stabilizationPoint: 60 },        // 60 matches
      cleanSheetRate: { factor: 0.68, stabilizationPoint: 35 },       // 35 matches
      goalConversionRate: { factor: 0.80, stabilizationPoint: 120 }   // 120 shots
    },
    hockey: {
      shootingPercentage: { factor: 0.75, stabilizationPoint: 300 },   // 300 shots
      savePercentage: { factor: 0.65, stabilizationPoint: 1500 },      // 1500 shots faced
      winPercentage: { factor: 0.70, stabilizationPoint: 82 }          // 82 games
    },
    // Default values for other sports or metrics
    default: { 
      winPercentage: { factor: 0.70, stabilizationPoint: 50 },
      scoringRate: { factor: 0.75, stabilizationPoint: 30 },
      anyMetric: { factor: 0.65, stabilizationPoint: 40 }
    }
  };
  
  // Get the sport factors or use default
  const sportFactors = factors[sport] || factors.default;
  
  // Get the specific metric or use a default within the sport
  return sportFactors[metric] || 
         sportFactors.anyMetric || 
         factors.default.anyMetric;
};

/**
 * Calculate the probability adjustment for a team/player based on regression to the mean
 * 
 * @param {Object} params - Parameters for the regression calculation
 * @param {number} params.currentPerformance - Current performance level
 * @param {number} params.baseline - Long-term average or baseline performance
 * @param {number} params.sampleSize - Number of observations in current performance
 * @param {string} params.sport - Sport name
 * @param {string} params.metric - Performance metric
 * @param {number} params.leagueAverage - League average for the metric
 * @param {number} params.originalProbability - User's original probability estimate
 * @returns {Object} - Regression analysis results
 */
const calculateRegressionAdjustment = (params) => {
  const {
    currentPerformance,
    baseline,
    sampleSize,
    sport,
    metric,
    leagueAverage,
    originalProbability
  } = params;
  
  // Get regression factors for this sport and metric
  const { factor: regressionFactor, stabilizationPoint } = 
    getSportSpecificRegressionFactors(sport, metric);
  
  // Calculate reliability based on sample size
  const reliability = calculateReliability(sampleSize, stabilizationPoint);
  
  // Estimate true talent level
  const estimatedTalent = estimateTrueTalent(currentPerformance, baseline, reliability);
  
  // Calculate expected regression
  const expectedPerformance = calculateRegression(currentPerformance, baseline, regressionFactor);
  
  // Standard deviation (approximation based on metric type)
  // This would ideally be calculated from historical data
  const standardDeviation = getMetricStandardDeviation(sport, metric, leagueAverage);
  
  // Calculate confidence interval
  const confidenceInterval = calculateConfidenceInterval(
    expectedPerformance, 
    standardDeviation, 
    sampleSize
  );
  
  // Calculate suggested probability adjustment
  // This is a simplified approach - actual implementation would depend on your specific model
  const performanceDifference = (currentPerformance - expectedPerformance) / standardDeviation;
  
  // Scale the probability adjustment based on the difference and original probability
  // This ensures the adjustment is proportional but doesn't result in probabilities > 1 or < 0
  const maxAdjustment = Math.min(originalProbability, 1 - originalProbability) * 0.5;
  const rawAdjustment = performanceDifference * 0.05; // 5% adjustment per standard deviation
  const adjustedProbability = originalProbability - Math.max(Math.min(rawAdjustment, maxAdjustment), -maxAdjustment);
  
  // Determine if we're dealing with an overperformance or underperformance
  const performanceStatus = currentPerformance > baseline ? 'overperforming' : 
                            currentPerformance < baseline ? 'underperforming' : 'average';
  
  return {
    currentPerformance,
    baseline,
    expectedPerformance,
    adjustedProbability,
    originalProbability,
    confidenceInterval,
    regressionFactor,
    reliability,
    performanceStatus,
    sampleSize,
    stabilizationPoint,
    standardDeviation,
    deviationsFromMean: performanceDifference,
    sport,
    metric
  };
};

/**
 * Get standard deviation estimate for different metrics
 * 
 * @param {string} sport - Sport name
 * @param {string} metric - Performance metric
 * @param {number} average - Average value of the metric
 * @returns {number} - Estimated standard deviation
 */
const getMetricStandardDeviation = (sport, metric, average) => {
  // These are estimates based on typical variability in each sport/metric
  // Ideally, these would be calculated from historical data
  
  const stdDevs = {
    basketball: {
      threePointPercentage: 0.05,
      freeThrowPercentage: 0.08,
      fieldGoalPercentage: 0.04,
      winPercentage: 0.15,
      pointsPerGame: 5.0,
      assistsPerGame: 1.5
    },
    baseball: {
      battingAverage: 0.025,
      onBasePercentage: 0.03,
      sluggingPercentage: 0.05,
      era: 0.75,
      winPercentage: 0.1
    },
    football: {
      passCompletionPercentage: 0.05,
      yardsPerAttempt: 1.0,
      winPercentage: 0.2,
      fieldGoalPercentage: 0.07
    },
    soccer: {
      scoringRate: 0.1,
      winPercentage: 0.15,
      cleanSheetRate: 0.12,
      goalConversionRate: 0.04
    },
    hockey: {
      shootingPercentage: 0.03,
      savePercentage: 0.015,
      winPercentage: 0.12
    },
    default: {
      winPercentage: 0.15,
      anyMetric: 0.1
    }
  };
  
  // Get the standard deviation for the specific sport and metric, or use a default
  const sportStdDevs = stdDevs[sport] || stdDevs.default;
  const stdDev = sportStdDevs[metric] || sportStdDevs.anyMetric || stdDevs.default.anyMetric;
  
  // For percentage metrics, make sure the standard deviation is appropriate
  // (i.e., doesn't result in impossible percentages)
  if (metric.includes('Percentage') && average !== undefined) {
    // Cap the standard deviation to prevent impossible values
    const maxStdDev = Math.min(average, 1 - average);
    return Math.min(stdDev, maxStdDev * 0.8); // 80% of the max possible std dev
  }
  
  return stdDev;
};

/**
 * Identify potential cognitive biases based on regression analysis
 * 
 * @param {Object} regressionResult - Result from calculateRegressionAdjustment
 * @returns {Array} - Array of potential cognitive biases and explanations
 */
const identifyCognitiveBiases = (regressionResult) => {
  const {
    currentPerformance,
    baseline,
    expectedPerformance,
    performanceStatus,
    deviationsFromMean,
    sampleSize,
    stabilizationPoint
  } = regressionResult;
  
  const biases = [];
  
  // Check for recency bias
  if (Math.abs(deviationsFromMean) > 1.5) {
    biases.push({
      type: 'recencyBias',
      description: 'Recency Bias',
      explanation: `Current ${performanceStatus} performance is ${Math.abs(deviationsFromMean).toFixed(1)} standard deviations from the mean, suggesting possible recency bias in probability estimates.`,
      severity: Math.min(Math.abs(deviationsFromMean) / 2, 1) // Scale from 0-1
    });
  }
  
  // Check for hot-hand fallacy
  if (performanceStatus === 'overperforming' && sampleSize < stabilizationPoint * 0.3) {
    biases.push({
      type: 'hotHandFallacy',
      description: 'Hot-Hand Fallacy',
      explanation: `Current hot streak (${sampleSize} observations) is smaller than the stabilization point (${stabilizationPoint}), suggesting caution when projecting continued high performance.`,
      severity: 1 - (sampleSize / (stabilizationPoint * 0.5)) // Scale from 0-1
    });
  }
  
  // Check for gambler's fallacy
  if (performanceStatus === 'underperforming' && Math.abs(currentPerformance - baseline) > 0.8 * getMetricStandardDeviation(regressionResult.sport, regressionResult.metric)) {
    biases.push({
      type: 'gamblersFallacy',
      description: "Gambler's Fallacy",
      explanation: `Be cautious about assuming an immediate return to baseline performance. Regression happens gradually over time, not necessarily in the next event.`,
      severity: 0.7 // Fixed severity since this is a common error
    });
  }
  
  // Check for small sample size issues
  if (sampleSize < stabilizationPoint * 0.2) {
    biases.push({
      type: 'smallSampleSize',
      description: 'Small Sample Size',
      explanation: `Current performance is based on a small sample (${sampleSize} vs. stabilization at ${stabilizationPoint}), making it less reliable for predictive purposes.`,
      severity: 1 - (sampleSize / (stabilizationPoint * 0.2)) // Scale from 0-1
    });
  }
  
  return biases;
};

module.exports = {
  calculateRegression,
  calculateConfidenceInterval,
  calculateReliability,
  estimateTrueTalent,
  getSportSpecificRegressionFactors,
  calculateRegressionAdjustment,
  identifyCognitiveBiases
}; 