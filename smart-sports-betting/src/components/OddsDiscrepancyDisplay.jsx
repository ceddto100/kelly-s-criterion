import React from 'react';
import PropTypes from 'prop-types';
import { 
  formatOdds, 
  formatProbabilityAsPercentage, 
  formatEdge, 
  formatExpectedValue, 
  getEdgeColor,
  getEdgeCategory,
  calculateKellyBetSize
} from '../utils/marketComparisonUtils';

/**
 * Display component for showing odds discrepancies and betting opportunities
 */
const OddsDiscrepancyDisplay = ({ 
  comparisonData, 
  userProbability, 
  bankroll, 
  kellyFraction = 'half', 
  minEdgeThreshold = 2, 
  userOddsFormat = 'american' 
}) => {
  if (!comparisonData || comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h3 className="text-lg font-medium text-gray-700">No Comparison Data Available</h3>
        <p className="text-gray-500 mt-2">
          Enter your probability estimate and select an event to find potential betting opportunities.
        </p>
      </div>
    );
  }

  // Filter opportunities based on minimum edge threshold
  const opportunities = comparisonData
    .filter(item => item.analysis.edgePercentage >= minEdgeThreshold)
    .sort((a, b) => b.analysis.edgePercentage - a.analysis.edgePercentage);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Betting Opportunities</h3>
        
        <div className="text-sm text-gray-600 flex items-center">
          <span className="hidden md:inline mr-2">Edge threshold:</span>
          <span className="font-medium">{minEdgeThreshold}%+</span>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">No betting opportunities found with {minEdgeThreshold}%+ edge</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((item, index) => {
            const { 
              bookmaker, 
              odds,
              probabilities: { implied, fair, user },
              analysis: { edgePercentage, expectedValue, bookmakerMargin }
            } = item;
            
            const edgeCategory = getEdgeCategory(edgePercentage);
            const edgeColor = getEdgeColor(edgePercentage);
            
            // Calculate Kelly bet size based on user's probability
            const kellyBet = calculateKellyBetSize(
              user,
              odds.decimal,
              bankroll,
              kellyFraction
            );
            
            return (
              <div key={`opportunity-${index}`} className="border rounded-lg overflow-hidden">
                <div className={`px-4 py-3 flex justify-between items-center bg-indigo-50 border-b`}>
                  <div>
                    <h4 className="font-semibold text-gray-800">{bookmaker}</h4>
                    <p className="text-sm text-gray-500">
                      Margin: {(bookmakerMargin * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: edgeColor }}>
                      {formatEdge(edgePercentage)}
                    </div>
                    <div className="text-xs uppercase tracking-wide font-medium mt-1 px-2 py-0.5 rounded-full inline-block"
                         style={{ backgroundColor: `${edgeColor}20`, color: edgeColor }}>
                      {edgeCategory} edge
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-y-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Odds</p>
                      <p className="font-medium text-gray-800">
                        {formatOdds(odds.decimal, userOddsFormat)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Market Prob.</p>
                      <p className="font-medium text-gray-800">
                        {formatProbabilityAsPercentage(implied, 1)}
                        <span className="text-xs text-gray-500 ml-1">impl.</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fair Prob.</p>
                      <p className="font-medium text-gray-800">
                        {formatProbabilityAsPercentage(fair, 1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Your Prob.</p>
                      <p className="font-medium text-indigo-600">
                        {formatProbabilityAsPercentage(user, 1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expected Value</p>
                      <p className="font-medium" style={{ color: expectedValue > 0 ? 'var(--color-success-600)' : 'var(--color-error-500)' }}>
                        {formatExpectedValue(expectedValue)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Kelly Bet ({kellyFraction})</p>
                      <p className="font-medium text-gray-800">
                        ${kellyBet.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">% of Bankroll</p>
                      <p className="font-medium text-gray-800">
                        {((kellyBet / bankroll) * 100).toFixed(2)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">To Win</p>
                      <p className="font-medium text-green-600">
                        ${(kellyBet * (odds.decimal - 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2`} 
                           style={{ backgroundColor: edgeColor }}></div>
                      <p className="text-sm text-gray-600">
                        {edgePercentage > 10 ? 'Strong value bet' : 
                         edgePercentage > 5 ? 'Good value bet' : 'Potential value'}
                      </p>
                    </div>
                    
                    <button className="px-4 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                      Place Bet
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {comparisonData.length > 0 && opportunities.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-700 mb-2">All Comparisons</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookmaker
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Odds
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impl. Prob
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edge
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EV
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonData.map((item, index) => (
                  <tr key={`comparison-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                      {item.bookmaker}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                      {formatOdds(item.odds.decimal, userOddsFormat)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                      {formatProbabilityAsPercentage(item.probabilities.implied, 1)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium"
                        style={{ color: getEdgeColor(item.analysis.edgePercentage) }}>
                      {formatEdge(item.analysis.edgePercentage)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium"
                        style={{ color: item.analysis.expectedValue > 0 ? 'var(--color-success-600)' : 'var(--color-error-500)' }}>
                      {formatExpectedValue(item.analysis.expectedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

OddsDiscrepancyDisplay.propTypes = {
  comparisonData: PropTypes.arrayOf(PropTypes.shape({
    bookmaker: PropTypes.string.isRequired,
    odds: PropTypes.shape({
      original: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      decimal: PropTypes.number.isRequired,
      format: PropTypes.string.isRequired
    }).isRequired,
    probabilities: PropTypes.shape({
      implied: PropTypes.number.isRequired,
      fair: PropTypes.number.isRequired,
      user: PropTypes.number.isRequired
    }).isRequired,
    analysis: PropTypes.shape({
      bookmakerMargin: PropTypes.number.isRequired,
      edgePercentage: PropTypes.number.isRequired,
      expectedValue: PropTypes.number.isRequired,
      isPositiveEV: PropTypes.bool.isRequired
    }).isRequired
  })),
  userProbability: PropTypes.number.isRequired,
  bankroll: PropTypes.number.isRequired,
  kellyFraction: PropTypes.string,
  minEdgeThreshold: PropTypes.number,
  userOddsFormat: PropTypes.string
};

export default OddsDiscrepancyDisplay; 