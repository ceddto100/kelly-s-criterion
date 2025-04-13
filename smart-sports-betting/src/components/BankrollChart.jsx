import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Default mock data
const defaultData = [
  { date: '2023-01-01', balance: 1000 },
  { date: '2023-01-15', balance: 1120 },
  { date: '2023-01-30', balance: 1050 },
  { date: '2023-02-15', balance: 1200 },
  { date: '2023-03-01', balance: 1350 },
  { date: '2023-03-15', balance: 1280 },
  { date: '2023-04-01', balance: 1420 }
];

// Default stats
const defaultStats = {
  roi: 42.0,
  winRate: 58.3,
  totalBets: 24
};

const BankrollChart = ({ data = defaultData, stats = defaultStats }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{new Date(label).toLocaleDateString()}</p>
          <p className="text-sm font-semibold text-indigo-600">
            Balance: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-800">Bankroll Performance</h2>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total ROI</p>
            <p className={`text-lg font-semibold ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.roi.toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-lg font-semibold text-gray-900">{stats.winRate.toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Bets</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalBets}</p>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={data[0]?.balance}
              stroke="#9CA3AF"
              strokeDasharray="3 3"
              label={{
                value: 'Initial Balance',
                position: 'right',
                fill: '#6B7280',
                fontSize: 12
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#4F46E5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          <span className="text-sm text-gray-600">Bankroll</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-400 border-dashed border-t-2"></div>
          <span className="text-sm text-gray-600">Initial Balance</span>
        </div>
      </div>
    </div>
  );
};

export default BankrollChart; 