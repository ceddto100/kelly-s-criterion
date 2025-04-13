import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PerformanceStats from '../components/PerformanceStats';
import BankrollChart from '../components/BankrollChart';
import betService from '../services/betService';

const Analytics = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bankrollData, setBankrollData] = useState([]);
  const [stats, setStats] = useState({});
  const [bets, setBets] = useState([]);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get all the analytics data from the API
        const [bankrollHistory, bettingStats, userBets] = await Promise.all([
          betService.getBankrollHistory(),
          betService.getBettingStats(),
          betService.getBets()
        ]);
        
        // Update state with the fetched data
        setBankrollData(bankrollHistory?.data || []);
        setStats(bettingStats || {});
        setBets(userBets?.data || []);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        
        // Set default mock data as fallback
        setBankrollData([
          { date: '2024-01-01', balance: 1000 },
          { date: '2024-01-15', balance: 1200 },
          { date: '2024-02-01', balance: 1150 },
          { date: '2024-02-15', balance: 1400 },
        ]);
        
        setStats({
          roi: 40,
          winRate: 65.5,
          totalBets: 20,
          profitLoss: 400,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bankroll Chart */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bankroll History</h3>
              </div>
              <div className="p-6">
                <BankrollChart data={bankrollData} stats={stats} />
              </div>
            </div>
            
            {/* Performance Stats */}
            <PerformanceStats stats={stats} bets={bets} />
            
            {/* Bet Insights */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bet Insights</h3>
              </div>
              <div className="px-6 py-5">
                {/* Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Average Bet Size</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.averageBetSize?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Biggest Win</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${stats.biggestWin?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Biggest Loss</h4>
                    <p className="text-2xl font-bold text-red-600">
                      ${Math.abs(stats.biggestLoss || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Current Streak</h4>
                    <p className={`text-2xl font-bold ${
                      stats.streaks?.currentStreak > 0 
                        ? 'text-green-600' 
                        : stats.streaks?.currentStreak < 0 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                    }`}>
                      {stats.streaks?.currentStreak || 0} {stats.streaks?.currentStreak > 0 ? 'Wins' : 'Losses'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Longest Win Streak</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.streaks?.longestWinStreak || 0}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Longest Loss Streak</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.streaks?.longestLossStreak || 0}
                    </p>
                  </div>
                </div>
                
                {/* Sport Breakdown or other charts would go here */}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Kelly's Criterion - Smart Betting Strategy Optimization
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics; 