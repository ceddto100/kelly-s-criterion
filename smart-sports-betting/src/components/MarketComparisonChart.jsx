import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import PropTypes from 'prop-types';
import { getEdgeColor, formatProbabilityAsPercentage } from '../utils/marketComparisonUtils';

/**
 * Custom tooltip for the chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const bookmaker = label;
  const userProb = payload.find(p => p.name === 'userProbability')?.value || 0;
  const fairProb = payload.find(p => p.name === 'fairProbability')?.value || 0;
  const impliedProb = payload.find(p => p.name === 'impliedProbability')?.value || 0;
  const edge = ((userProb - fairProb) / fairProb) * 100;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-bold text-gray-800">{bookmaker}</p>
      <div className="mt-2 space-y-1">
        <p className="text-sm">
          <span className="font-medium">Your Estimate:</span>{' '}
          <span className="text-indigo-600">{formatProbabilityAsPercentage(userProb, 2)}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium">Fair Market:</span>{' '}
          <span className="text-green-600">{formatProbabilityAsPercentage(fairProb, 2)}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium">Implied:</span>{' '}
          <span className="text-gray-600">{formatProbabilityAsPercentage(impliedProb, 2)}</span>
        </p>
        <p className="text-sm font-medium mt-2">
          <span>Edge:</span>{' '}
          <span style={{ color: getEdgeColor(edge) }}>
            {edge > 0 ? '+' : ''}{edge.toFixed(2)}%
          </span>
        </p>
      </div>
    </div>
  );
};

/**
 * Chart component for comparing user probabilities with market probabilities
 */
const MarketComparisonChart = ({ comparisonData, userProbability }) => {
  // If no data available, show placeholder
  if (!comparisonData || comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h3 className="text-lg font-medium text-gray-700">No Market Data Available</h3>
        <p className="text-gray-500 mt-2">
          Select an event and enter your probability estimate to compare with market odds.
        </p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = comparisonData.map(item => ({
    bookmaker: item.bookmaker,
    impliedProbability: item.probabilities.implied,
    fairProbability: item.probabilities.fair,
    userProbability: item.probabilities.user,
    edgePercentage: item.analysis.edgePercentage
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Probability Comparison</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            barSize={20}
            barGap={0}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="bookmaker" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, Math.max(
                Math.ceil(Math.max(...chartData.map(d => d.userProbability)) * 10) / 10,
                Math.ceil(Math.max(...chartData.map(d => d.impliedProbability)) * 10) / 10,
                1
              )]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <ReferenceLine 
              y={userProbability} 
              stroke="#6366F1" 
              strokeDasharray="3 3" 
              label={{ 
                value: "Your Estimate", 
                fill: "#6366F1", 
                position: "insideRight"
              }} 
            />
            <Bar 
              name="Implied Probability" 
              dataKey="impliedProbability" 
              fill="#9CA3AF" 
            />
            <Bar 
              name="Fair Probability" 
              dataKey="fairProbability" 
              fill="#10B981"
            />
            <Bar 
              name="Edge" 
              dataKey="fairProbability" 
              fill="#transparent"
              minPointSize={3}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getEdgeColor(entry.edgePercentage)}
                  fillOpacity={0.2}
                  stroke={getEdgeColor(entry.edgePercentage)}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">Your Probability</p>
          <p className="text-xl font-semibold text-indigo-600">
            {formatProbabilityAsPercentage(userProbability, 1)}
          </p>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">Avg Implied Probability</p>
          <p className="text-xl font-semibold text-gray-700">
            {formatProbabilityAsPercentage(
              chartData.reduce((sum, item) => sum + item.impliedProbability, 0) / chartData.length,
              1
            )}
          </p>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">Avg Fair Probability</p>
          <p className="text-xl font-semibold text-green-600">
            {formatProbabilityAsPercentage(
              chartData.reduce((sum, item) => sum + item.fairProbability, 0) / chartData.length,
              1
            )}
          </p>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">Best Edge</p>
          <p className="text-xl font-semibold" 
             style={{ color: getEdgeColor(Math.max(...chartData.map(item => item.edgePercentage))) }}>
            {(() => {
              const bestEdge = Math.max(...chartData.map(item => item.edgePercentage));
              return `${bestEdge > 0 ? '+' : ''}${bestEdge.toFixed(1)}%`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

MarketComparisonChart.propTypes = {
  comparisonData: PropTypes.arrayOf(PropTypes.shape({
    bookmaker: PropTypes.string.isRequired,
    probabilities: PropTypes.shape({
      implied: PropTypes.number.isRequired,
      fair: PropTypes.number.isRequired,
      user: PropTypes.number.isRequired
    }).isRequired,
    analysis: PropTypes.shape({
      edgePercentage: PropTypes.number.isRequired
    }).isRequired
  })),
  userProbability: PropTypes.number.isRequired
};

export default MarketComparisonChart; 