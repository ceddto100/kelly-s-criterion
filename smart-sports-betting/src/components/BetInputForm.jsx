import React, { useState, useEffect } from 'react';

const BetInputForm = ({ onCalculate, defaultOddsFormat = 'american' }) => {
  const [formData, setFormData] = useState({
    matchTitle: '',
    probability: 50,
    odds: '',
    oddsFormat: defaultOddsFormat,
    confidenceLevel: 3,
  });

  // Update oddsFormat when default changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      oddsFormat: defaultOddsFormat
    }));
  }, [defaultOddsFormat]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.matchTitle.trim()) {
      alert('Please enter a match title');
      return;
    }

    if (!formData.odds) {
      alert('Please enter odds');
      return;
    }

    // Validate odds format
    if (formData.oddsFormat === 'american') {
      // American odds should be a valid number
      if (!/^[+-]?\d+$/.test(formData.odds)) {
        alert('American odds should be in format like +150 or -110');
        return;
      }
    } else if (formData.oddsFormat === 'decimal') {
      // Decimal odds should be a number greater than 1
      const decimalOdds = parseFloat(formData.odds);
      if (isNaN(decimalOdds) || decimalOdds < 1) {
        alert('Decimal odds should be a number greater than 1 (e.g., 2.5)');
        return;
      }
    }

    onCalculate(formData);
  };

  const handleProbabilityChange = (value) => {
    setFormData(prev => ({
      ...prev,
      probability: Math.min(99, Math.max(1, value))
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Bet Analysis</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game/Match Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game/Match Title
          </label>
          <input
            type="text"
            value={formData.matchTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, matchTitle: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Lakers vs Warriors"
            required
          />
        </div>

        {/* Win Probability Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Win Probability: {formData.probability}%
          </label>
          <input
            type="range"
            min="1"
            max="99"
            value={formData.probability}
            onChange={(e) => handleProbabilityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1%</span>
            <span>50%</span>
            <span>99%</span>
          </div>
        </div>

        {/* Odds Input */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={formData.oddsFormat}
              onChange={(e) => setFormData(prev => ({ ...prev, oddsFormat: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="american">American</option>
              <option value="decimal">Decimal</option>
              <option value="fractional">Fractional</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Odds
            </label>
            <input
              type="text"
              value={formData.odds}
              onChange={(e) => setFormData(prev => ({ ...prev, odds: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={
                formData.oddsFormat === 'american' 
                  ? "e.g. +150 or -110" 
                  : formData.oddsFormat === 'decimal'
                    ? "e.g. 2.50" 
                    : "e.g. 3/2"
              }
              required
            />
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, confidenceLevel: level }))}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors
                  ${formData.confidenceLevel === level
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculate Kelly Bet
        </button>
      </form>
    </div>
  );
};

export default BetInputForm; 