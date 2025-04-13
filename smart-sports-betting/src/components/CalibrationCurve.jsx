import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const CalibrationCurve = ({ data }) => {
  // Add ideal calibration line points
  const processedData = [...data];
  
  // Create ideal calibration data points if they don't exist
  const hasIdealLine = processedData.some(point => point.type === 'ideal');
  
  // Add ideal calibration points
  const idealPoints = [
    { predictedProbability: 0, actualOutcome: 0, type: 'ideal' },
    { predictedProbability: 0.1, actualOutcome: 0.1, type: 'ideal' },
    { predictedProbability: 0.2, actualOutcome: 0.2, type: 'ideal' },
    { predictedProbability: 0.3, actualOutcome: 0.3, type: 'ideal' },
    { predictedProbability: 0.4, actualOutcome: 0.4, type: 'ideal' },
    { predictedProbability: 0.5, actualOutcome: 0.5, type: 'ideal' },
    { predictedProbability: 0.6, actualOutcome: 0.6, type: 'ideal' },
    { predictedProbability: 0.7, actualOutcome: 0.7, type: 'ideal' },
    { predictedProbability: 0.8, actualOutcome: 0.8, type: 'ideal' },
    { predictedProbability: 0.9, actualOutcome: 0.9, type: 'ideal' },
    { predictedProbability: 1, actualOutcome: 1, type: 'ideal' }
  ];
  
  if (!hasIdealLine) {
    processedData.push(...idealPoints);
  }

  // Group actual outcomes by predicted probability bins
  const binSize = 0.1;
  const bins = {};
  
  // Only group actual data points, not ideal line points
  data.forEach(point => {
    if (point.type !== 'ideal') {
      const binIndex = Math.floor(point.predictedProbability / binSize) * binSize;
      if (!bins[binIndex]) {
        bins[binIndex] = {
          predictedProbability: binIndex,
          totalOutcomes: 0,
          positiveOutcomes: 0
        };
      }
      bins[binIndex].totalOutcomes++;
      if (point.actualOutcome === 1) {
        bins[binIndex].positiveOutcomes++;
      }
    }
  });
  
  // Calculate actual rate for each bin
  const binData = Object.values(bins).map(bin => ({
    predictedProbability: bin.predictedProbability,
    actualOutcome: bin.totalOutcomes > 0 ? bin.positiveOutcomes / bin.totalOutcomes : 0,
    sampleSize: bin.totalOutcomes,
    type: 'bin'
  }));
  
  // Combine bin data with ideal line
  const chartData = [
    ...idealPoints,
    ...binData
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-bold">{`Predicted: ${(point.predictedProbability * 100).toFixed(1)}%`}</p>
          <p>{`Actual: ${(point.actualOutcome * 100).toFixed(1)}%`}</p>
          {point.sampleSize && (
            <p>{`Sample Size: ${point.sampleSize}`}</p>
          )}
          {point.date && (
            <p>{`Date: ${point.date}`}</p>
          )}
          {point.opponent && (
            <p>{`Opponent: ${point.opponent}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="predictedProbability" 
            type="number"
            domain={[0, 1]}
            tickCount={11}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{ value: 'Predicted Probability', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            domain={[0, 1]}
            tickCount={11}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{ value: 'Actual Probability', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="actualOutcome"
            data={binData}
            name="Actual Outcomes"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="actualOutcome"
            data={idealPoints}
            name="Perfect Calibration"
            stroke="#82ca9d"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CalibrationCurve; 