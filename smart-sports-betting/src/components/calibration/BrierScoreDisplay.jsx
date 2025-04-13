import React, { useState } from 'react';
import MarketComparisonChart from '../../components/MarketComparisonChart';
import OddsDiscrepancyDisplay from '../../components/OddsDiscrepancyDisplay';
import { compareOdds } from '../../services/marketOddsService';

const BrierScoreDisplay = ({ score, userSettings = {} }) => {
  const [eventId, setEventId] = useState('');
  const [yourEstimate, setYourEstimate] = useState(0.5);
  const [comparisonData, setComparisonData] = useState(null);

  const getScoreColor = (score) => {
    if (score <= 0.1) return 'text-green-600';
    if (score <= 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreInterpretation = (score) => {
    if (score <= 0.1) return 'Excellent calibration';
    if (score <= 0.2) return 'Good calibration';
    if (score <= 0.3) return 'Fair calibration';
    return 'Poor calibration';
  };

  const handleCompare = async () => {
    if (!eventId) return;
    
    try {
      const result = await compareOdds({
        eventId,
        marketType: 'moneyline',
        userProbability: yourEstimate,
        outcome: 'home'
      });
      setComparisonData(result.comparisons);
    } catch (error) {
      console.error('Error comparing odds:', error);
    }
  };

  const handleEstimateChange = (e) => {
    setYourEstimate(parseFloat(e.target.value));
  };

  const handleEventIdChange = (e) => {
    setEventId(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Brier Score</h3>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(3)}
          </div>
          <div className="ml-4">
            <div className="text-sm text-gray-600">
              {getScoreInterpretation(score)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Lower scores indicate better calibration
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <div className="font-medium">Score Range:</div>
          <div>0.0 - Perfect calibration</div>
          <div>0.25 - Random guessing</div>
          <div>1.0 - Worst possible</div>
        </div>
      </div>

      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Market Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
              Event ID
            </label>
            <input
              type="text"
              id="eventId"
              value={eventId}
              onChange={handleEventIdChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter event ID"
            />
          </div>
          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-1">
              Your Probability Estimate
            </label>
            <input
              type="number"
              id="probability"
              value={yourEstimate}
              onChange={handleEstimateChange}
              min="0"
              max="1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={handleCompare}
          disabled={!eventId}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          Compare with Market
        </button>
      </div>

      {comparisonData && (
        <>
          <MarketComparisonChart 
            comparisonData={comparisonData} 
            userProbability={yourEstimate} 
          />
          <div className="mt-6">
            <OddsDiscrepancyDisplay 
              comparisonData={comparisonData}
              userProbability={yourEstimate}
              bankroll={userSettings.bankroll || 1000}
              kellyFraction={userSettings.defaultKellyFraction || 'half'}
              userOddsFormat={userSettings.oddsFormat || 'american'}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BrierScoreDisplay; 