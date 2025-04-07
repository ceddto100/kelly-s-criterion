import React, { useState, useEffect } from 'react';

const BetResultDisplay = ({ betAnalysis, onSave, defaultKellyFraction = 'full', bankroll = 1000, maxBetPercentage = 10 }) => {
  const [kellyFraction, setKellyFraction] = useState(defaultKellyFraction); // full, half, quarter

  // Update Kelly fraction when default changes
  useEffect(() => {
    setKellyFraction(defaultKellyFraction);
  }, [defaultKellyFraction]);

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAdjustedSize = (size) => {
    switch (kellyFraction) {
      case 'half':
        return size / 2;
      case 'quarter':
        return size / 4;
      default:
        return size;
    }
  };

  // Apply Kelly fraction adjustment
  let adjustedBetSize = calculateAdjustedSize(betAnalysis.recommendedSize);
  
  // Apply max bet percentage cap
  adjustedBetSize = Math.min(adjustedBetSize, maxBetPercentage);
  
  // Calculate actual bet amount in dollars
  const betAmount = (adjustedBetSize / 100) * bankroll;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatOdds = (odds, format) => {
    if (format === 'american') {
      return odds.toString().startsWith('+') || odds.toString().startsWith('-') 
        ? odds 
        : (parseFloat(odds) > 0 ? `+${odds}` : odds);
    }
    return odds;
  };

  const handleSave = () => {
    onSave({
      ...betAnalysis,
      kellyFraction,
      adjustedBetSize,
      betAmount,
      date: new Date().toISOString(),
      result: 'pending'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Match Title */}
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">{betAnalysis.matchTitle}</h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Win Probability: {betAnalysis.probability}%</span>
            <span>Odds: {formatOdds(betAnalysis.odds, betAnalysis.oddsFormat)}</span>
          </div>
        </div>

        {/* Edge and Risk Level */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Edge</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {betAnalysis.edge.toFixed(2)}%
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(betAnalysis.riskLevel)}`}>
            {betAnalysis.riskLevel} Risk
          </div>
        </div>

        {/* Kelly Fraction Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kelly Criterion
          </label>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {['full', 'half', 'quarter'].map((fraction) => (
              <button
                key={fraction}
                onClick={() => setKellyFraction(fraction)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors
                  ${kellyFraction === fraction
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {fraction.charAt(0).toUpperCase() + fraction.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Bet Size */}
        <div className="bg-indigo-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-indigo-800 mb-1">
            Recommended Bet Size
          </h3>
          <p className="text-3xl font-bold text-indigo-900 mb-1">
            {adjustedBetSize.toFixed(2)}%
          </p>
          <p className="text-sm text-indigo-700">
            {formatCurrency(betAmount)} of your {formatCurrency(bankroll)} bankroll
          </p>
          {adjustedBetSize === maxBetPercentage && (
            <p className="text-xs text-orange-600 mt-2">
              * Capped at maximum bet size of {maxBetPercentage}%
            </p>
          )}
        </div>

        {/* Expected Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600">Expected Value</h4>
            <p className="text-xl font-semibold text-gray-900">
              {betAnalysis.expectedValue.toFixed(2)}%
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Break-Even Prob.</h4>
            <p className="text-xl font-semibold text-gray-900">
              {betAnalysis.breakEvenProb.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save this bet
        </button>
      </div>
    </div>
  );
};

export default BetResultDisplay; 