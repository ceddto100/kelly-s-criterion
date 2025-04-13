/**
 * Utility functions for regression to the mean calculations on the frontend
 */

/**
 * Format a regression factor as a readable percentage
 * @param {number} factor - Regression factor (0-1)
 * @returns {string} - Formatted percentage string
 */
export const formatRegressionFactor = (factor) => {
  return `${Math.round(factor * 100)}%`;
};

/**
 * Format a sample size relative to stabilization point
 * @param {number} sampleSize - Current sample size
 * @param {number} stabilizationPoint - Point at which the metric becomes 50% reliable
 * @returns {string} - Formatted string with percentage of stabilization
 */
export const formatReliability = (sampleSize, stabilizationPoint) => {
  const percentage = Math.min(100, Math.round((sampleSize / stabilizationPoint) * 100));
  return `${percentage}% reliable (${sampleSize}/${stabilizationPoint})`;
};

/**
 * Calculate the reliability color based on sample size
 * @param {number} sampleSize - Current sample size
 * @param {number} stabilizationPoint - Point at which the metric becomes 50% reliable
 * @returns {string} - CSS color code
 */
export const getReliabilityColor = (sampleSize, stabilizationPoint) => {
  const ratio = sampleSize / stabilizationPoint;
  
  if (ratio >= 1) return 'var(--color-success-600)';
  if (ratio >= 0.5) return 'var(--color-success-500)';
  if (ratio >= 0.3) return 'var(--color-warning-400)';
  if (ratio >= 0.1) return 'var(--color-warning-500)';
  return 'var(--color-error-500)';
};

/**
 * Format a performance difference with + or - sign
 * @param {number} current - Current performance value
 * @param {number} baseline - Baseline performance value
 * @param {boolean} isPercentage - Whether the values are percentages
 * @returns {string} - Formatted difference
 */
export const formatPerformanceDifference = (current, baseline, isPercentage = false) => {
  const difference = current - baseline;
  const sign = difference >= 0 ? '+' : '';
  
  if (isPercentage) {
    return `${sign}${(difference * 100).toFixed(1)}%`;
  }
  
  return `${sign}${difference.toFixed(2)}`;
};

/**
 * Get color for displaying performance difference
 * @param {number} current - Current performance value
 * @param {number} baseline - Baseline performance value
 * @param {boolean} higherIsBetter - Whether higher values are better for this metric
 * @returns {string} - CSS color value
 */
export const getPerformanceColor = (current, baseline, higherIsBetter = true) => {
  const difference = current - baseline;
  
  // If the direction of difference aligns with what's better
  const isPositive = (difference > 0 && higherIsBetter) || (difference < 0 && !higherIsBetter);
  
  if (Math.abs(difference) < 0.01) return 'var(--color-gray-600)'; // Essentially the same
  
  if (isPositive) {
    if (Math.abs(difference) > 0.1) return 'var(--color-success-600)';
    return 'var(--color-success-500)';
  } else {
    if (Math.abs(difference) > 0.1) return 'var(--color-error-600)';
    return 'var(--color-error-500)';
  }
};

/**
 * Format a confidence interval range
 * @param {Object} interval - Confidence interval object with lower and upper bounds
 * @param {boolean} asPercentage - Whether to format as percentage
 * @returns {string} - Formatted range
 */
export const formatConfidenceInterval = (interval, asPercentage = false) => {
  if (!interval || interval.lower === undefined || interval.upper === undefined) {
    return 'N/A';
  }
  
  if (asPercentage) {
    return `${(interval.lower * 100).toFixed(1)}% - ${(interval.upper * 100).toFixed(1)}%`;
  }
  
  return `${interval.lower.toFixed(2)} - ${interval.upper.toFixed(2)}`;
};

/**
 * Format a probability adjustment as a percentage with sign
 * @param {number} original - Original probability
 * @param {number} adjusted - Adjusted probability
 * @returns {string} - Formatted adjustment
 */
export const formatProbabilityAdjustment = (original, adjusted) => {
  const difference = adjusted - original;
  const sign = difference >= 0 ? '+' : '';
  return `${sign}${(difference * 100).toFixed(1)}%`;
};

/**
 * Get color for displaying probability adjustment
 * @param {number} original - Original probability
 * @param {number} adjusted - Adjusted probability
 * @returns {string} - CSS color value
 */
export const getAdjustmentColor = (original, adjusted) => {
  const difference = Math.abs(adjusted - original);
  
  if (difference < 0.01) return 'var(--color-gray-600)'; // Minimal adjustment
  if (difference < 0.03) return 'var(--color-indigo-400)'; // Small adjustment
  if (difference < 0.05) return 'var(--color-indigo-500)'; // Moderate adjustment
  return 'var(--color-indigo-600)'; // Significant adjustment
};

/**
 * Format a reliability ratio (0-1) as a percentage
 * @param {number} reliability - Reliability coefficient
 * @returns {string} - Formatted percentage
 */
export const formatReliabilityPercent = (reliability) => {
  return `${Math.round(reliability * 100)}%`;
};

/**
 * Get a human-readable description of the regression effect
 * @param {string} performanceStatus - 'overperforming', 'underperforming', or 'average'
 * @param {number} originalProb - Original probability estimate
 * @param {number} adjustedProb - Adjusted probability estimate
 * @returns {string} - Description of the regression effect
 */
export const getRegressionDescription = (performanceStatus, originalProb, adjustedProb) => {
  const difference = adjustedProb - originalProb;
  const absDifference = Math.abs(difference);
  
  let magnitude = 'slight';
  if (absDifference > 0.08) magnitude = 'significant';
  else if (absDifference > 0.03) magnitude = 'moderate';
  
  if (absDifference < 0.01) {
    return 'No significant regression adjustment needed.';
  }
  
  if (performanceStatus === 'overperforming') {
    return `Team is likely overperforming their true skill level. ${magnitude.charAt(0).toUpperCase() + magnitude.slice(1)} downward adjustment recommended.`;
  } else if (performanceStatus === 'underperforming') {
    return `Team is likely underperforming their true skill level. ${magnitude.charAt(0).toUpperCase() + magnitude.slice(1)} upward adjustment recommended.`;
  }
  
  return 'Team is performing near their expected level. Minor adjustment recommended.';
};

/**
 * Get a color based on the bias severity
 * @param {number} severity - Bias severity (0-1)
 * @returns {string} - CSS color value
 */
export const getBiasSeverityColor = (severity) => {
  if (severity >= 0.8) return 'var(--color-error-600)';
  if (severity >= 0.5) return 'var(--color-warning-500)';
  if (severity >= 0.3) return 'var(--color-warning-400)';
  return 'var(--color-indigo-400)';
};

/**
 * Format a metric name for display
 * @param {string} metric - Metric name (e.g., 'threePointPercentage')
 * @returns {string} - Formatted display name (e.g., 'Three Point Percentage')
 */
export const formatMetricName = (metric) => {
  // Add a space before each capital letter and capitalize the first letter
  const formatted = metric
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
  
  return formatted;
};

/**
 * Generate data for a regression visualization
 * @param {number} baseline - Baseline performance
 * @param {number} current - Current performance
 * @param {number} expected - Expected performance after regression
 * @param {Object} confidenceInterval - Confidence interval object
 * @returns {Array} - Data array for charts
 */
export const generateRegressionVisualizationData = (baseline, current, expected, confidenceInterval) => {
  return [
    {
      name: 'Baseline',
      value: baseline,
      color: '#6B7280' // Gray-500
    },
    {
      name: 'Current',
      value: current,
      color: current > baseline ? '#10B981' : '#EF4444' // Green-500 or Red-500
    },
    {
      name: 'Expected',
      value: expected,
      color: '#6366F1' // Indigo-500
    },
    {
      name: 'Lower Bound',
      value: confidenceInterval.lower,
      color: '#A5B4FC' // Indigo-300
    },
    {
      name: 'Upper Bound',
      value: confidenceInterval.upper,
      color: '#A5B4FC' // Indigo-300
    }
  ];
};

/**
 * Calculate appropriate step size for chart axis
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Appropriate step size
 */
export const calculateAxisStep = (min, max) => {
  const range = max - min;
  
  if (range <= 0.1) return 0.01;
  if (range <= 0.5) return 0.05;
  if (range <= 1) return 0.1;
  if (range <= 5) return 0.5;
  if (range <= 10) return 1;
  if (range <= 50) return 5;
  if (range <= 100) return 10;
  return 20;
};

/**
 * Get the domain for a performance chart
 * @param {Array} data - Visualization data array
 * @param {boolean} isPercentage - Whether the values are percentages
 * @returns {Array} - Domain array [min, max]
 */
export const getChartDomain = (data, isPercentage = false) => {
  if (!data || data.length === 0) return [0, 1];
  
  // Get min and max values
  const values = data.map(d => d.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  
  // Add some padding
  const padding = (max - min) * 0.1;
  min = Math.max(0, min - padding);
  max = max + padding;
  
  // For percentages, always cap at 0 and 1
  if (isPercentage) {
    min = Math.max(0, min);
    max = Math.min(1, max);
  }
  
  return [min, max];
}; 