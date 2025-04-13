import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ProbabilityVisualization = ({ probability }) => {
  const data = [
    {
      name: 'Win',
      value: probability,
      fill: '#4F46E5'
    },
    {
      name: 'Lose',
      value: 1 - probability,
      fill: '#EF4444'
    }
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 1]} />
          <YAxis
            dataKey="name"
            type="category"
            width={80}
          />
          <Tooltip
            formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {(probability * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Win Probability</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {((1 - probability) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Lose Probability</div>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityVisualization; 