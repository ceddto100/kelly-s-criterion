import React from 'react';

const BetResultDisplay = ({ result }) => {
  if (!result) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getBetSizeColor = (kellyPercentage) => {
    if (kellyPercentage <= 0) return 'text-red-600';
    if (kellyPercentage < 0.05) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Bet Analysis Results</h2>
      
      <div className="space-y-6">
        {/* Kelly Criterion Results */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Kelly Criterion</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Optimal Kelly Percentage</p>
              <p className={`text-3xl font-bold ${getBetSizeColor(result.kellyPercentage)}`}>
                {formatPercentage(result.kellyPercentage)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {result.kellyPercentage <= 0 
                  ? "No edge found. Avoid this bet."
                  : "Percentage of bankroll to wager"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Full Kelly Bet</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(result.kellyBet)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Half Kelly Bet</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(result.kellyBet / 2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input Summary */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Input Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Win Probability</p>
              <p className="text-xl font-medium text-gray-900">
                {formatPercentage(result.probability)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">American Odds</p>
              <p className="text-xl font-medium text-gray-900">
                {result.odds > 0 ? `+${result.odds}` : result.odds}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Sport</p>
              <p className="text-xl font-medium text-gray-900">
                {result.sport.charAt(0).toUpperCase() + result.sport.slice(1)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Bet Type</p>
              <p className="text-xl font-medium text-gray-900">
                {result.betType.charAt(0).toUpperCase() + result.betType.slice(1)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Recommendation */}
        <div className="rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500">
          <h3 className="text-md font-medium text-blue-800 mb-1">Recommendation</h3>
          <p className="text-sm text-blue-700">
            {result.kellyPercentage <= 0 
              ? "This bet has no mathematical edge. It's recommended to avoid it."
              : result.kellyPercentage < 0.05
                ? "This bet has a small edge. Consider using a half Kelly or less to manage risk."
                : "This bet has a good edge. Using half Kelly is recommended for long-term bankroll growth."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetResultDisplay; 