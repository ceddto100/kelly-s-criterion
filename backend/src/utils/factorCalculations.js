/**
 * Utility functions for factor-based probability calculations
 */

/**
 * Normalize a factor value to a probability contribution (0-1)
 * 
 * @param {*} value - The factor value
 * @param {Object} factor - Factor definition
 * @returns {number} - Normalized probability contribution (0-1)
 */
const normalizeFactorValue = (value, factor) => {
  const { inputType, minValue, maxValue } = factor;
  
  // Handle different input types
  switch (inputType) {
    case 'binary':
      // For binary inputs, convert to 0 or 1
      return value ? 1 : 0;
      
    case 'scale':
      // For scale inputs, normalize to 0-1 range
      if (minValue !== undefined && maxValue !== undefined) {
        return (value - minValue) / (maxValue - minValue);
      }
      return value / 10; // Default 0-10 scale
      
    case 'percentage':
      // Percentage is already 0-1
      return value;
      
    case 'select':
      // For select inputs, map options to values
      if (factor.options && factor.options.length > 0) {
        const index = factor.options.indexOf(value);
        return index >= 0 ? index / (factor.options.length - 1) : 0;
      }
      return 0;
      
    default:
      return 0;
  }
};

/**
 * Calculate the weighted probability contribution of a factor
 * 
 * @param {number} normalizedValue - Normalized factor value (0-1)
 * @param {number} weight - Factor weight (0-10)
 * @param {number} historicalImpact - Historical impact of the factor (0-1)
 * @returns {number} - Weighted probability contribution
 */
const calculateFactorContribution = (normalizedValue, weight, historicalImpact) => {
  // Normalize weight to 0-1 range
  const normalizedWeight = weight / 10;
  
  // Calculate contribution based on value, weight, and historical impact
  // This formula applies the weight and scales by historical impact
  return normalizedValue * normalizedWeight * historicalImpact;
};

/**
 * Apply correlation adjustments to factor contributions
 * 
 * @param {Array} factorContributions - Array of {factorKey, contribution} objects
 * @param {Map} correlationMatrix - Matrix of correlations between factors
 * @returns {Array} - Adjusted factor contributions
 */
const applyCorrelationAdjustments = (factorContributions, correlationMatrix) => {
  if (!correlationMatrix || correlationMatrix.size === 0) {
    return factorContributions;
  }

  const adjustedContributions = [...factorContributions];
  
  // For each pair of factors, apply correlation adjustment
  for (let i = 0; i < adjustedContributions.length; i++) {
    const factorA = adjustedContributions[i];
    
    for (let j = i + 1; j < adjustedContributions.length; j++) {
      const factorB = adjustedContributions[j];
      
      // Get correlation between these factors
      const correlationKey = `${factorA.factorKey}-${factorB.factorKey}`;
      const correlation = correlationMatrix.get(correlationKey) || 0;
      
      if (correlation !== 0) {
        // Adjust contributions based on correlation
        // If correlation is positive, reduce to avoid double-counting
        // If correlation is negative, increase to account for opposite effects
        const adjustment = factorA.contribution * factorB.contribution * correlation;
        
        // Apply adjustment proportionally to each factor based on their relative contributions
        const totalContribution = factorA.contribution + factorB.contribution;
        if (totalContribution > 0) {
          const factorARatio = factorA.contribution / totalContribution;
          const factorBRatio = factorB.contribution / totalContribution;
          
          factorA.contribution -= adjustment * factorARatio;
          factorB.contribution -= adjustment * factorBRatio;
        }
      }
    }
  }
  
  // Ensure all contributions are within valid range (0-1)
  adjustedContributions.forEach(factor => {
    factor.contribution = Math.max(0, Math.min(1, factor.contribution));
  });
  
  return adjustedContributions;
};

/**
 * Calculate final probability based on factor contributions
 * 
 * @param {Array} factorContributions - Array of factor contribution values
 * @param {number} baseProbability - Starting probability (default: 0.5)
 * @returns {number} - Calculated probability (0-1)
 */
const calculateFinalProbability = (factorContributions, baseProbability = 0.5) => {
  if (!factorContributions || factorContributions.length === 0) {
    return baseProbability;
  }
  
  // Calculate total positive and negative contributions
  let positiveContribution = 0;
  let negativeContribution = 0;
  
  factorContributions.forEach(factor => {
    const contribution = factor.contribution - 0.5;
    if (contribution > 0) {
      positiveContribution += contribution;
    } else {
      negativeContribution += Math.abs(contribution);
    }
  });
  
  // Apply positive contributions to probability
  let finalProbability = baseProbability;
  if (positiveContribution > 0) {
    finalProbability += (1 - baseProbability) * positiveContribution;
  }
  
  // Apply negative contributions to probability
  if (negativeContribution > 0) {
    finalProbability -= baseProbability * negativeContribution;
  }
  
  // Ensure probability is within valid range (0-1)
  return Math.max(0, Math.min(1, finalProbability));
};

/**
 * Calculate confidence level based on factor inputs
 * 
 * @param {Array} factors - Array of factor objects with values and weights
 * @param {number} totalFactors - Total number of possible factors for this sport
 * @returns {number} - Confidence level (0-1)
 */
const calculateConfidence = (factors, totalFactors) => {
  if (!factors || factors.length === 0) {
    return 0;
  }
  
  // Base confidence on:
  // 1. Number of factors used vs total available (coverage)
  // 2. Average weight of factors used (importance)
  // 3. Variance in factor values (consistency)
  
  const coverage = factors.length / Math.max(1, totalFactors);
  
  let totalWeight = 0;
  let totalVariance = 0;
  
  factors.forEach(factor => {
    totalWeight += factor.weight;
    
    // Calculate variance from middle value (0.5)
    const normalizedValue = typeof factor.normalizedValue === 'number' ? factor.normalizedValue : 0.5;
    totalVariance += Math.pow(normalizedValue - 0.5, 2);
  });
  
  const avgWeight = totalWeight / factors.length / 10; // Normalize to 0-1
  const avgVariance = totalVariance / factors.length * 4; // Normalize to 0-1 (max variance is 0.25)
  
  // Calculate confidence as weighted sum of metrics
  const confidence = (coverage * 0.3) + (avgWeight * 0.5) + (avgVariance * 0.2);
  
  return Math.max(0, Math.min(1, confidence));
};

/**
 * Calculate confidence interval for the final probability
 * 
 * @param {number} probability - Calculated probability
 * @param {number} confidence - Confidence level (0-1)
 * @param {number} confidenceLevel - Desired statistical confidence level (default: 0.95)
 * @returns {Object} - Confidence interval {lower, upper}
 */
const calculateConfidenceInterval = (probability, confidence, confidenceLevel = 0.95) => {
  // Convert confidence to standard error
  // Lower confidence = higher standard error
  const standardError = (1 - confidence) * 0.25;
  
  // Z-score for common confidence levels
  const zScores = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  const zScore = zScores[confidenceLevel] || 1.96;
  const marginOfError = zScore * standardError;
  
  return {
    lower: Math.max(0, probability - marginOfError),
    upper: Math.min(1, probability + marginOfError)
  };
};

/**
 * Process factors and calculate probability and confidence
 * 
 * @param {Array} factorInputs - User-provided factor inputs
 * @param {Array} factorDefinitions - Factor definitions from database
 * @param {Map} correlationMatrix - Correlation matrix between factors
 * @returns {Object} - Probability calculation results
 */
const processFactor = (factorInputs, factorDefinitions, correlationMatrix) => {
  if (!factorInputs || factorInputs.length === 0 || !factorDefinitions || factorDefinitions.length === 0) {
    return {
      probability: 0.5,
      confidence: 0,
      factors: [],
      confidenceInterval: { lower: 0.25, upper: 0.75 }
    };
  }
  
  // Map factor inputs to definitions
  const factorMap = new Map();
  factorDefinitions.forEach(factor => {
    factorMap.set(factor.key, factor);
  });
  
  // Process each factor input
  const processedFactors = factorInputs
    .filter(input => factorMap.has(input.factorKey))
    .map(input => {
      const factorDef = factorMap.get(input.factorKey);
      const normalizedValue = normalizeFactorValue(input.value, factorDef);
      const weight = input.weight || factorDef.getUserWeight(input.userId) || factorDef.statisticalWeight;
      const contribution = calculateFactorContribution(
        normalizedValue, 
        weight, 
        factorDef.historicalImpact
      );
      
      return {
        factorKey: input.factorKey,
        name: factorDef.name,
        value: input.value,
        normalizedValue,
        weight,
        contribution,
        category: factorDef.category
      };
    });
  
  // Apply correlation adjustments
  const adjustedFactors = applyCorrelationAdjustments(processedFactors, correlationMatrix);
  
  // Calculate final probability
  const probability = calculateFinalProbability(adjustedFactors);
  
  // Calculate confidence level
  const confidence = calculateConfidence(adjustedFactors, factorDefinitions.length);
  
  // Calculate confidence interval
  const confidenceInterval = calculateConfidenceInterval(probability, confidence);
  
  return {
    probability,
    confidence,
    confidenceInterval,
    factors: adjustedFactors
  };
};

/**
 * Generate correlation matrix from factor definitions
 * 
 * @param {Array} factorDefinitions - Factor definitions with correlation data
 * @returns {Map} - Correlation matrix between factors
 */
const generateCorrelationMatrix = (factorDefinitions) => {
  const correlationMatrix = new Map();
  
  if (!factorDefinitions || factorDefinitions.length === 0) {
    return correlationMatrix;
  }
  
  // Populate matrix with all factor correlations
  factorDefinitions.forEach(factorA => {
    if (factorA.correlations && factorA.correlations.size > 0) {
      factorA.correlations.forEach((correlation, factorBKey) => {
        const key = `${factorA.key}-${factorBKey}`;
        correlationMatrix.set(key, correlation);
        
        // Also set the reverse direction (matrix is symmetric)
        const reverseKey = `${factorBKey}-${factorA.key}`;
        correlationMatrix.set(reverseKey, correlation);
      });
    }
  });
  
  return correlationMatrix;
};

module.exports = {
  normalizeFactorValue,
  calculateFactorContribution,
  applyCorrelationAdjustments,
  calculateFinalProbability,
  calculateConfidence,
  calculateConfidenceInterval,
  processFactor,
  generateCorrelationMatrix
}; 