import React, { useState } from 'react';

const BetInputForm = ({ onCalculate, settings }) => {
  const [formData, setFormData] = useState({
    probability: 0.55,
    odds: -110,
    oddsFormat: 'american',
    bankroll: settings?.bankroll || settings?.initialBankroll || 1000,
    betType: 'spread',
    sport: 'basketball'
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleProbabilitySlider = (e) => {
    setFormData(prev => ({
      ...prev,
      probability: parseFloat(e.target.value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const formatProbability = (prob) => {
    return `${(prob * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Kelly Criterion Calculator</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Win Probability */}
          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700">
              Win Probability: {formatProbability(formData.probability)}
            </label>
            <input
              id="probability"
              name="probability"
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={formData.probability}
              onChange={handleProbabilitySlider}
              className="mt-1 w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>50%</span>
              <span>99%</span>
            </div>
          </div>

          {/* Odds */}
          <div>
            <label htmlFor="odds" className="block text-sm font-medium text-gray-700">
              Odds (American)
            </label>
            <input
              id="odds"
              name="odds"
              type="number"
              value={formData.odds}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Example: +150 (bet $100 to win $150) or -110 (bet $110 to win $100)
            </p>
          </div>

          {/* Bankroll */}
          <div>
            <label htmlFor="bankroll" className="block text-sm font-medium text-gray-700">
              Available Bankroll
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="bankroll"
                name="bankroll"
                type="number"
                min="1"
                value={formData.bankroll}
                onChange={handleChange}
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Sport and Bet Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700">
                Sport
              </label>
              <select
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="baseball">Baseball</option>
                <option value="hockey">Hockey</option>
                <option value="soccer">Soccer</option>
              </select>
            </div>
            <div>
              <label htmlFor="betType" className="block text-sm font-medium text-gray-700">
                Bet Type
              </label>
              <select
                id="betType"
                name="betType"
                value={formData.betType}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="spread">Spread</option>
                <option value="moneyline">Moneyline</option>
                <option value="total">Total (Over/Under)</option>
                <option value="prop">Prop Bet</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Calculate Optimal Bet
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BetInputForm; 