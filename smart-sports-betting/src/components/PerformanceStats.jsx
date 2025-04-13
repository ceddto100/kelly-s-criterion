import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PerformanceStats = ({ stats, bets }) => {
  const [timeframe, setTimeframe] = useState('all');
  
  // Default stats if not provided
  const defaultStats = {
    roi: 0,
    winRate: 0,
    totalBets: 0,
    averageBetSize: 0,
    profitLoss: 0,
    biggestWin: 0,
    biggestLoss: 0,
    streaks: {
      currentStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
    },
    sportBreakdown: [],
    betTypeBreakdown: [],
    resultsByMonth: [],
  };
  
  // Merge provided stats with defaults
  const mergedStats = { ...defaultStats, ...stats };
  
  // Calculate win/loss ratio for pie chart
  const resultData = [
    { name: 'Wins', value: mergedStats.winRate },
    { name: 'Losses', value: 100 - mergedStats.winRate },
  ];
  
  const COLORS = ['#16a34a', '#dc2626'];
  
  // Filter bets by timeframe if needed
  const getFilteredBets = () => {
    if (!bets || !bets.length) return [];
    
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return bets.filter(bet => new Date(bet.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return bets.filter(bet => new Date(bet.date) >= monthAgo);
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return bets.filter(bet => new Date(bet.date) >= yearAgo);
      default:
        return bets;
    }
  };
  
  const filteredBets = getFilteredBets();
  
  // Calculate profit/loss by day for the selected timeframe
  const getProfitLossByDay = () => {
    if (!filteredBets.length) return [];
    
    const profitByDay = {};
    
    filteredBets.forEach(bet => {
      const date = bet.date.split('T')[0]; // Format YYYY-MM-DD
      profitByDay[date] = (profitByDay[date] || 0) + (bet.profitLoss || 0);
    });
    
    return Object.keys(profitByDay).map(date => ({
      date,
      profitLoss: profitByDay[date],
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const profitLossByDay = getProfitLossByDay();
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
        
        <div className="mt-3 flex space-x-4">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'week'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-indigo-50 text-gray-700 hover:bg-indigo-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'month'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-indigo-50 text-gray-700 hover:bg-indigo-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'year'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-indigo-50 text-gray-700 hover:bg-indigo-100'
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-indigo-50 text-gray-700 hover:bg-indigo-100'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="px-6 py-5">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">ROI</h4>
            <p className={`text-2xl font-bold ${mergedStats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mergedStats.roi}%
            </p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">Win Rate</h4>
            <p className="text-2xl font-bold text-gray-900">{mergedStats.winRate}%</p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">Total Bets</h4>
            <p className="text-2xl font-bold text-gray-900">{filteredBets.length || mergedStats.totalBets}</p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">Net Profit/Loss</h4>
            <p className={`text-2xl font-bold ${mergedStats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${mergedStats.profitLoss}
            </p>
          </div>
        </div>
        
        {/* Win/Loss Distribution - Pie Chart */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Win/Loss Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resultData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {resultData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Daily Results - Bar Chart */}
        {profitLossByDay.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Profit/Loss</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitLossByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar
                    dataKey="profitLoss"
                    fill={(entry) => (entry.profitLoss >= 0 ? '#16a34a' : '#dc2626')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceStats; 