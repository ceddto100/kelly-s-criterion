// Mock calibration service to simulate API responses
const mockCalibrationData = {
  basketball: {
    spread: {
      metrics: {
        brierScore: 0.18,
        totalPredictions: 78,
        overconfidence: 0.12,
        underconfidence: 0.04,
        calibrationCurve: [
          { bin: 0.0, predicted: 0.05, actual: 0.0, count: 4 },
          { bin: 0.1, predicted: 0.15, actual: 0.10, count: 8 },
          { bin: 0.2, predicted: 0.25, actual: 0.20, count: 10 },
          { bin: 0.3, predicted: 0.35, actual: 0.30, count: 6 },
          { bin: 0.4, predicted: 0.45, actual: 0.38, count: 8 },
          { bin: 0.5, predicted: 0.55, actual: 0.50, count: 12 },
          { bin: 0.6, predicted: 0.65, actual: 0.58, count: 9 },
          { bin: 0.7, predicted: 0.75, actual: 0.65, count: 8 },
          { bin: 0.8, predicted: 0.85, actual: 0.72, count: 7 },
          { bin: 0.9, predicted: 0.95, actual: 0.80, count: 6 }
        ],
      },
      recommendations: [
        {
          description: "Overconfidence in high probability predictions",
          suggestedAction: "Lower your confidence for predictions above 80% probability",
          severity: "medium"
        },
        {
          description: "Good calibration in middle ranges (40-60%)",
          suggestedAction: "Continue your approach for 50/50 scenarios",
          severity: "low"
        }
      ]
    },
    moneyline: {
      metrics: {
        brierScore: 0.22,
        totalPredictions: 56,
        overconfidence: 0.15,
        underconfidence: 0.08,
        calibrationCurve: [
          { bin: 0.0, predicted: 0.05, actual: 0.0, count: 2 },
          { bin: 0.1, predicted: 0.15, actual: 0.12, count: 5 },
          { bin: 0.2, predicted: 0.25, actual: 0.18, count: 6 },
          { bin: 0.3, predicted: 0.35, actual: 0.28, count: 7 },
          { bin: 0.4, predicted: 0.45, actual: 0.36, count: 8 },
          { bin: 0.5, predicted: 0.55, actual: 0.48, count: 9 },
          { bin: 0.6, predicted: 0.65, actual: 0.55, count: 7 },
          { bin: 0.7, predicted: 0.75, actual: 0.62, count: 6 },
          { bin: 0.8, predicted: 0.85, actual: 0.70, count: 4 },
          { bin: 0.9, predicted: 0.95, actual: 0.75, count: 2 }
        ],
      },
      recommendations: [
        {
          description: "Significant overconfidence bias",
          suggestedAction: "Consider applying a general -10% adjustment to your predictions",
          severity: "high"
        },
        {
          description: "Underestimating low probability events",
          suggestedAction: "Look for more value in underdogs",
          severity: "medium"
        }
      ]
    },
    total: {
      metrics: {
        brierScore: 0.14,
        totalPredictions: 42,
        overconfidence: 0.08,
        underconfidence: 0.06,
        calibrationCurve: [
          { bin: 0.0, predicted: 0.05, actual: 0.05, count: 3 },
          { bin: 0.1, predicted: 0.15, actual: 0.15, count: 4 },
          { bin: 0.2, predicted: 0.25, actual: 0.22, count: 5 },
          { bin: 0.3, predicted: 0.35, actual: 0.33, count: 6 },
          { bin: 0.4, predicted: 0.45, actual: 0.40, count: 5 },
          { bin: 0.5, predicted: 0.55, actual: 0.53, count: 5 },
          { bin: 0.6, predicted: 0.65, actual: 0.60, count: 4 },
          { bin: 0.7, predicted: 0.75, actual: 0.70, count: 4 },
          { bin: 0.8, predicted: 0.85, actual: 0.80, count: 3 },
          { bin: 0.9, predicted: 0.95, actual: 0.90, count: 3 }
        ],
      },
      recommendations: [
        {
          description: "Well calibrated predictions overall",
          suggestedAction: "Continue with your current approach for totals",
          severity: "low"
        }
      ]
    }
  },
  football: {
    spread: {
      metrics: {
        brierScore: 0.20,
        totalPredictions: 64,
        overconfidence: 0.14,
        underconfidence: 0.06,
        calibrationCurve: [
          { bin: 0.0, predicted: 0.05, actual: 0.02, count: 5 },
          { bin: 0.1, predicted: 0.15, actual: 0.12, count: 6 },
          { bin: 0.2, predicted: 0.25, actual: 0.20, count: 7 },
          { bin: 0.3, predicted: 0.35, actual: 0.30, count: 8 },
          { bin: 0.4, predicted: 0.45, actual: 0.38, count: 7 },
          { bin: 0.5, predicted: 0.55, actual: 0.48, count: 8 },
          { bin: 0.6, predicted: 0.65, actual: 0.55, count: 7 },
          { bin: 0.7, predicted: 0.75, actual: 0.65, count: 6 },
          { bin: 0.8, predicted: 0.85, actual: 0.70, count: 5 },
          { bin: 0.9, predicted: 0.95, actual: 0.80, count: 5 }
        ],
      },
      recommendations: [
        {
          description: "Overconfidence in high probability predictions",
          suggestedAction: "Be more cautious with heavy favorites",
          severity: "medium"
        },
        {
          description: "Decent calibration in middle ranges",
          suggestedAction: "Focus more on close matchups where you show good judgment",
          severity: "low"
        }
      ]
    },
    moneyline: {
      metrics: {
        brierScore: 0.24,
        totalPredictions: 58,
        overconfidence: 0.18,
        underconfidence: 0.06,
        calibrationCurve: [
          { bin: 0.0, predicted: 0.05, actual: 0.04, count: 4 },
          { bin: 0.1, predicted: 0.15, actual: 0.10, count: 5 },
          { bin: 0.2, predicted: 0.25, actual: 0.18, count: 6 },
          { bin: 0.3, predicted: 0.35, actual: 0.26, count: 6 },
          { bin: 0.4, predicted: 0.45, actual: 0.34, count: 7 },
          { bin: 0.5, predicted: 0.55, actual: 0.46, count: 7 },
          { bin: 0.6, predicted: 0.65, actual: 0.52, count: 6 },
          { bin: 0.7, predicted: 0.75, actual: 0.62, count: 6 },
          { bin: 0.8, predicted: 0.85, actual: 0.68, count: 5 },
          { bin: 0.9, predicted: 0.95, actual: 0.75, count: 6 }
        ],
      },
      recommendations: [
        {
          description: "Strong overconfidence bias across all predictions",
          suggestedAction: "Adjust all your confidence levels downward by 15-20%",
          severity: "high"
        },
        {
          description: "Particularly poor calibration with strong favorites",
          suggestedAction: "Avoid heavy favorites or adjust probabilities significantly",
          severity: "high"
        }
      ]
    }
  }
};

// Mock API functions to mimic the backend API
const mockCalibrationService = {
  getCalibrationMetrics: (sport, betType) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sportData = mockCalibrationData[sport];
        if (!sportData) {
          reject(new Error(`No data for sport: ${sport}`));
          return;
        }
        
        const betTypeData = sportData[betType];
        if (!betTypeData) {
          reject(new Error(`No data for bet type: ${betType} in sport: ${sport}`));
          return;
        }
        
        resolve({
          metrics: betTypeData.metrics,
          recommendations: betTypeData.recommendations
        });
      }, 500); // Simulate network delay
    });
  },
  
  recordPrediction: (predictionData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just pretend we saved it
        resolve({ success: true });
      }, 500);
    });
  }
};

export default mockCalibrationService; 