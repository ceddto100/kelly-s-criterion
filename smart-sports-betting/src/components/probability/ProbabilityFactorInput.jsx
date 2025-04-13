import React from 'react';

const ProbabilityFactorInput = ({ factors, onChange }) => {
  const factorLabels = {
    homeAdvantage: 'Home Advantage',
    recentForm: 'Recent Form',
    headToHead: 'Head-to-Head',
    injuries: 'Injuries',
    weather: 'Weather'
  };

  return (
    <div className="space-y-4">
      {Object.entries(factors).map(([factor, value]) => (
        <div key={factor} className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 w-32">
            {factorLabels[factor]}
          </label>
          <input
            type="range"
            min="-0.2"
            max="0.2"
            step="0.01"
            value={value}
            onChange={(e) => onChange(factor, e.target.value)}
            className="w-48 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 w-16 text-right">
            {(value * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProbabilityFactorInput; 