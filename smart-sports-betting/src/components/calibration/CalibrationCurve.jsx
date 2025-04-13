import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CalibrationCurve = ({ data }) => {
  // Add ideal calibration line
  const chartData = data.map(point => ({
    ...point,
    ideal: point.bin
  }));

  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bin"
              label={{ value: 'Predicted Probability', position: 'bottom' }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <YAxis
              label={{ value: 'Actual Probability', angle: -90, position: 'left' }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip
              formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
              labelFormatter={(value) => `Predicted: ${(value * 100).toFixed(0)}%`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="ideal"
              name="Ideal"
              stroke="#6B7280"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Additional information - improve grid layout */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Probability Bins</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.map((point, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="font-medium text-sm text-gray-900 mb-1 border-b pb-1">
                {`${(point.bin * 100).toFixed(0)}%-${((point.bin + 0.1) * 100).toFixed(0)}%`}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Predicted:</span>
                  <span className="font-medium text-green-600">{(point.predicted * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actual:</span>
                  <span className="font-medium text-blue-600">{(point.actual * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Count:</span>
                  <span className="font-medium">{point.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalibrationCurve; 