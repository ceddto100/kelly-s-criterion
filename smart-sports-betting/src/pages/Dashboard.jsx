import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BankrollChart from '../components/BankrollChart';
import BetTable from '../components/BetTable';
import { analyzeBet } from '../utils/betCalculations';
import { useAuth } from '../contexts/AuthContext';
import useApi from '../hooks/useApi';
import BetInputForm from '../components/BetInputForm';
import BetResultDisplay from '../components/BetResultDisplay';
import UserSettings from '../components/UserSettings';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentBets: [],
    bankrollData: [],
    bankrollStats: {
      roi: 15.4,
      winRate: 62.5,
      totalBets: 16
    },
    upcomingEvents: []
  });

  const [betResult, setBetResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    bankroll: 1000,
    defaultKellyFraction: 'half',
    maxBetPercentage: 5,
    baseUnitSize: 100,
  });

  useEffect(() => {
    // In a real app, we would load this data from the API
    // This is just mock data for now
    setDashboardData({
      recentBets: [
        { id: 1, date: '2023-04-01', team: 'Lakers', opponent: 'Celtics', betType: 'Spread', odds: -110, stake: 100, outcome: 'Win', profit: 91 },
        { id: 2, date: '2023-03-28', team: 'Warriors', opponent: 'Suns', betType: 'Moneyline', odds: +150, stake: 100, outcome: 'Loss', profit: -100 },
        { id: 3, date: '2023-03-25', team: 'Bucks', opponent: 'Heat', betType: 'Total', odds: -105, stake: 105, outcome: 'Win', profit: 100 }
      ],
      bankrollData: [
        { date: '2023-01-01', balance: 1000 },
        { date: '2023-01-15', balance: 1120 },
        { date: '2023-01-30', balance: 1050 },
        { date: '2023-02-15', balance: 1200 },
        { date: '2023-03-01', balance: 1350 },
        { date: '2023-03-15', balance: 1280 },
        { date: '2023-04-01', balance: 1420 }
      ],
      bankrollStats: {
        roi: 42.0,
        winRate: 58.3,
        totalBets: 24
      },
      upcomingEvents: [
        { id: 1, date: '2023-04-05', team1: 'Lakers', team2: 'Warriors', time: '7:30 PM ET' },
        { id: 2, date: '2023-04-06', team1: 'Celtics', team2: 'Bucks', time: '8:00 PM ET' }
      ]
    });
  }, []);

  const handleCalculate = (formData) => {
    // Convert probability from percentage to decimal if needed
    const probabilityDecimal = formData.probability;
    
    // Analyze the bet using Kelly criterion
    const result = analyzeBet({
      probability: probabilityDecimal,
      odds: formData.odds,
      bankroll: formData.bankroll,
      sport: formData.sport,
      betType: formData.betType
    });
    
    // Set the result to display
    setBetResult(result);
  };

  const handleSaveSettings = (newSettings) => {
    console.log("Saving settings:", newSettings);
    setSettings(newSettings);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    console.log("Cancelling settings");
    setShowSettings(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name || 'Guest'}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Current Bankroll</p>
          <p className="text-2xl font-bold text-gray-900">${dashboardData.bankrollData[dashboardData.bankrollData.length - 1]?.balance}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">ROI</p>
          <p className={`text-2xl font-bold ${dashboardData.bankrollStats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardData.bankrollStats.roi.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Win Rate</p>
          <p className="text-2xl font-bold text-indigo-600">{dashboardData.bankrollStats.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Total Bets</p>
          <p className="text-2xl font-bold text-gray-900">{dashboardData.bankrollStats.totalBets}</p>
        </div>
      </div>

      {/* Bankroll Chart */}
      <BankrollChart 
        data={dashboardData.bankrollData} 
        stats={dashboardData.bankrollStats} 
      />

      {/* Kelly Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BetInputForm onCalculate={handleCalculate} settings={settings} />
        <BetResultDisplay result={betResult} />
      </div>

      {/* Recent Bets */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Bets</h2>
          <Link to="/bets" className="text-indigo-600 hover:text-indigo-800">View All</Link>
        </div>
        <BetTable bets={dashboardData.recentBets} />
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
          <Link to="/events" className="text-indigo-600 hover:text-indigo-800">View All</Link>
        </div>
        <div className="space-y-4">
          {dashboardData.upcomingEvents.map((event) => (
            <div key={event.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">{event.date}</p>
                <p className="text-md font-medium text-gray-900">{event.team1} vs {event.team2}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{event.time}</p>
                <button className="mt-1 text-sm text-indigo-600 hover:text-indigo-800">Analyze</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <UserSettings
              settings={settings}
              onSave={handleSaveSettings}
              onCancel={handleCancelSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 