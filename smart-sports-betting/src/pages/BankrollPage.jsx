import React, { useState, useEffect } from 'react';
import BankrollChart from '../components/BankrollChart';
import { useAuth } from '../contexts/AuthContext';

const BankrollPage = () => {
  const { currentUser } = useAuth();
  const [bankrollData, setBankrollData] = useState([]);
  const [bankrollStats, setBankrollStats] = useState({
    roi: 0,
    winRate: 0,
    totalBets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const mockData = [
      { date: '2023-01-01', balance: 1000 },
      { date: '2023-01-15', balance: 1120 },
      { date: '2023-01-30', balance: 1050 },
      { date: '2023-02-15', balance: 1200 },
      { date: '2023-03-01', balance: 1350 },
      { date: '2023-03-15', balance: 1280 },
      { date: '2023-04-01', balance: 1420 }
    ];

    const mockStats = {
      roi: 42.0,
      winRate: 58.3,
      totalBets: 24
    };

    // Simulate API delay
    setTimeout(() => {
      setBankrollData(mockData);
      setBankrollStats(mockStats);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bankroll Management</h1>
          <p className="text-gray-600">
            Track your bankroll performance and betting history over time.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Bankroll Chart */}
            <BankrollChart data={bankrollData} stats={bankrollStats} />

            {/* Additional Bankroll Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Bankroll Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Current Balance</h3>
                  <p className="text-3xl font-bold text-indigo-600">
                    ${bankrollData[bankrollData.length - 1]?.balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Starting: ${bankrollData[0]?.balance.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Profit/Loss</h3>
                  <p className={`text-3xl font-bold ${(bankrollData[bankrollData.length - 1]?.balance - bankrollData[0]?.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(bankrollData[bankrollData.length - 1]?.balance - bankrollData[0]?.balance).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {((bankrollData[bankrollData.length - 1]?.balance / bankrollData[0]?.balance - 1) * 100).toFixed(1)}% change
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Kelly Strategy</h3>
                  <p className="text-3xl font-bold text-gray-800">Half Kelly</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended for optimal growth
                  </p>
                </div>
              </div>
            </div>
            
            {/* Betting History Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Betting History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bet Type</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wager</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2023-04-01</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Basketball</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Spread</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$100</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">Win</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">+$91</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2023-03-28</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Football</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moneyline</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$150</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">Loss</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">-$150</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2023-03-15</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Basketball</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$120</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">Win</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">+$110</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Full History →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankrollPage; 