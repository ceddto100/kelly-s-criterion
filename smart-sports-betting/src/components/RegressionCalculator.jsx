import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ErrorBar
} from 'recharts';
import PropTypes from 'prop-types';
import { calculateRegression, getFactorsForSport, getSupportedMetrics } from '../services/regressionService';
import { 
  formatRegressionFactor, 
  formatReliability, 
  getReliabilityColor, 
  formatPerformanceDifference,
  formatConfidenceInterval,
  formatProbabilityAdjustment,
  getAdjustmentColor,
  formatMetricName,
  getRegressionDescription,
  generateRegressionVisualizationData,
  getChartDomain,
  calculateAxisStep,
  getPerformanceColor
} from '../utils/regressionUtils';

import BiasWarningDisplay from './BiasWarningDisplay';

/**
 * Regression to the Mean Calculator Component
 */
const RegressionCalculator = ({ 
  originalProbability = 0.5, 
  onProbabilityAdjusted = () => {},
  initialSport = 'basketball'
}) => {
  // Component state
  const [teamId, setTeamId] = useState('');
  const [sport, setSport] = useState(initialSport);
  const [metric, setMetric] = useState('');
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regressionResult, setRegressionResult] = useState(null);
  const [supportedMetrics, setSupportedMetrics] = useState([]);
  const [supportedSports, setSupportedSports] = useState([
    'basketball', 'baseball', 'football', 'soccer', 'hockey'
  ]);
  const [selectedTab, setSelectedTab] = useState('calculator');
  const [adjustedProbability, setAdjustedProbability] = useState(originalProbability);

  // Load supported metrics when sport changes
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await getSupportedMetrics(sport);
        setSupportedMetrics(metrics);
        
        // Set default metric if available
        if (metrics.length > 0 && !metric) {
          setMetric(metrics[0]);
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
        setError('Failed to load metrics for this sport');
      }
    };
    
    if (sport) {
      loadMetrics();
    }
  }, [sport]);

  // Keep adjusted probability in sync with original when it changes externally
  useEffect(() => {
    if (!regressionResult) {
      setAdjustedProbability(originalProbability);
    }
  }, [originalProbability]);

  // Handle form submission
  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!teamId || !sport || !metric) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await calculateRegression({
        teamId,
        sport,
        metric,
        originalProbability,
        season
      });
      
      setRegressionResult(result);
      setAdjustedProbability(result.regression.adjustedProbability);
    } catch (error) {
      console.error('Error calculating regression:', error);
      setError(error.response?.data?.error || 'Failed to calculate regression adjustment');
    } finally {
      setLoading(false);
    }
  };

  // Handle applying the adjustment
  const handleApplyAdjustment = () => {
    if (regressionResult) {
      onProbabilityAdjusted(adjustedProbability);
    }
  };

  // Handle resetting the adjustment
  const handleResetAdjustment = () => {
    setAdjustedProbability(originalProbability);
  };

  // Handle manual adjustment changes
  const handleManualAdjustment = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setAdjustedProbability(value);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Regression to the Mean Calculator</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('calculator')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedTab === 'calculator' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setSelectedTab('education')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedTab === 'education' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Learn
          </button>
        </div>
      </div>
      
      {selectedTab === 'calculator' ? (
        <div>
          <form onSubmit={handleCalculate} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
                  Team ID
                </label>
                <input
                  type="text"
                  id="teamId"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter team identifier"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  id="sport"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {supportedSports.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Metric
                </label>
                <select
                  id="metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a metric</option>
                  {supportedMetrics.map((m) => (
                    <option key={m} value={m}>
                      {formatMetricName(m)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <input
                  type="text"
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Season (e.g., 2023)"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="originalProbability" className="block text-sm font-medium text-gray-700 mb-1">
                Your Probability Estimate
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="originalProbability"
                  min="0"
                  max="1"
                  step="0.01"
                  value={originalProbability}
                  readOnly
                  className="w-full mr-4"
                />
                <span className="text-lg font-medium text-gray-700">
                  {(originalProbability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
              >
                {loading ? 'Calculating...' : 'Calculate Adjustment'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mb-6 px-4 py-3 rounded-md bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}
          
          {regressionResult && (
            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Regression Analysis Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Performance Status</h4>
                    <p className="text-2xl font-bold" style={{ 
                      color: getPerformanceColor(
                        regressionResult.regression.currentPerformance, 
                        regressionResult.regression.baseline
                      ) 
                    }}>
                      {regressionResult.regression.performanceStatus.charAt(0).toUpperCase() + 
                       regressionResult.regression.performanceStatus.slice(1)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPerformanceDifference(
                        regressionResult.regression.currentPerformance,
                        regressionResult.regression.baseline,
                        metric.includes('Percentage')
                      )} from baseline
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Metric Reliability</h4>
                    <p className="text-2xl font-bold" style={{ 
                      color: getReliabilityColor(
                        regressionResult.regression.sampleSize, 
                        regressionResult.regression.stabilizationPoint
                      ) 
                    }}>
                      {formatReliability(
                        regressionResult.regression.sampleSize, 
                        regressionResult.regression.stabilizationPoint
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Regression factor: {formatRegressionFactor(regressionResult.regression.regressionFactor)}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={generateRegressionVisualizationData(
                          regressionResult.regression.baseline,
                          regressionResult.regression.currentPerformance,
                          regressionResult.regression.expectedPerformance,
                          regressionResult.regression.confidenceInterval
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                          domain={getChartDomain(
                            generateRegressionVisualizationData(
                              regressionResult.regression.baseline,
                              regressionResult.regression.currentPerformance,
                              regressionResult.regression.expectedPerformance,
                              regressionResult.regression.confidenceInterval
                            ),
                            metric.includes('Percentage')
                          )}
                          tickFormatter={(value) => metric.includes('Percentage') ? `${(value * 100).toFixed(0)}%` : value.toFixed(2)}
                        />
                        <Tooltip 
                          formatter={(value) => [
                            metric.includes('Percentage') ? `${(value * 100).toFixed(1)}%` : value.toFixed(3),
                            ''
                          ]}
                        />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name={formatMetricName(metric)} 
                          fill="#6366F1"
                        >
                          {generateRegressionVisualizationData(
                            regressionResult.regression.baseline,
                            regressionResult.regression.currentPerformance,
                            regressionResult.regression.expectedPerformance,
                            regressionResult.regression.confidenceInterval
                          ).map((entry, index) => (
                            <ErrorBar 
                              key={index} 
                              width={0} 
                              strokeWidth={2} 
                              stroke={entry.color} 
                              style={{ fill: entry.color }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Expected regression: {formatPerformanceDifference(
                      regressionResult.regression.expectedPerformance,
                      regressionResult.regression.currentPerformance,
                      metric.includes('Percentage')
                    )}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Probability Adjustment</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {getRegressionDescription(
                      regressionResult.regression.performanceStatus,
                      regressionResult.regression.originalProbability,
                      regressionResult.regression.adjustedProbability
                    )}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-1/3 pr-4">
                      <div className="text-sm text-gray-600 mb-1">Original Probability</div>
                      <div className="text-lg font-medium text-gray-800">
                        {(regressionResult.regression.originalProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="w-1/3 px-4 flex flex-col items-center">
                      <div className="text-sm text-gray-600 mb-1">Adjustment</div>
                      <div className="text-lg font-medium" style={{ 
                        color: getAdjustmentColor(
                          regressionResult.regression.originalProbability,
                          regressionResult.regression.adjustedProbability
                        ) 
                      }}>
                        {formatProbabilityAdjustment(
                          regressionResult.regression.originalProbability,
                          regressionResult.regression.adjustedProbability
                        )}
                      </div>
                    </div>
                    
                    <div className="w-1/3 pl-4">
                      <div className="text-sm text-gray-600 mb-1">Adjusted Probability</div>
                      <div className="text-lg font-medium text-indigo-600">
                        {(adjustedProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="adjustedProbability" className="block text-sm font-medium text-gray-700 mb-1">
                      Fine-tune adjusted probability
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="adjustedProbability"
                        min="0"
                        max="1"
                        step="0.01"
                        value={adjustedProbability}
                        onChange={handleManualAdjustment}
                        className="w-full mr-4"
                      />
                      <span className="text-lg font-medium text-indigo-600">
                        {(adjustedProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleResetAdjustment}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyAdjustment}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Apply Adjustment
                    </button>
                  </div>
                </div>
                
                {regressionResult.potentialBiases && regressionResult.potentialBiases.length > 0 && (
                  <BiasWarningDisplay biases={regressionResult.potentialBiases} />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">What is Regression to the Mean?</h3>
            <p className="text-gray-700">
              Regression to the mean is a statistical phenomenon where extreme measurements tend to be followed by 
              measurements closer to the average. In sports betting, this means teams that are performing 
              exceptionally well or poorly will likely move closer to their true skill level over time.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Why Regression Matters in Betting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Overreaction to Recent Performance</h4>
                <p className="text-sm text-gray-600">
                  Bettors often give too much weight to recent performance, creating opportunities 
                  when the market overreacts to hot or cold streaks that are likely to regress.
                </p>
              </div>
              
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Small Sample Sizes</h4>
                <p className="text-sm text-gray-600">
                  Early in a season, performance metrics can be misleading due to small sample sizes. 
                  Regression helps estimate what part of performance is skill vs. random variance.
                </p>
              </div>
              
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Different Metrics Stabilize at Different Rates</h4>
                <p className="text-sm text-gray-600">
                  Some statistics like 3-point shooting percentage require large samples to be reliable, 
                  while others like strikeout rate stabilize more quickly.
                </p>
              </div>
              
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Find Value in the Market</h4>
                <p className="text-sm text-gray-600">
                  Understanding regression can help you identify value when the betting market is 
                  slow to account for expected regression effects.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Common Cognitive Biases</h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Recency Bias</h4>
                <p className="text-sm text-gray-600">
                  The tendency to place too much weight on recent events while undervaluing long-term trends.
                  Example: Assuming a team that won its last 5 games has become elite, ignoring their previous average performance.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Hot-Hand Fallacy</h4>
                <p className="text-sm text-gray-600">
                  The belief that a person who has experienced success has a greater chance of further success.
                  Example: Believing a player who has made several shots in a row is more likely to make the next one.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Gambler's Fallacy</h4>
                <p className="text-sm text-gray-600">
                  The belief that if something happens more frequently than normal during a given period, it will happen less frequently in the future.
                  Example: Assuming a team "must win" after several losses or that a player is "due for a big game" after underperforming.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

RegressionCalculator.propTypes = {
  originalProbability: PropTypes.number,
  onProbabilityAdjusted: PropTypes.func,
  initialSport: PropTypes.string
};

export default RegressionCalculator; 