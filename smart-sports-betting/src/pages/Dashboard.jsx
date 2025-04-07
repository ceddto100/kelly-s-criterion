import React, { useState } from 'react';
import BetInputForm from '../components/BetInputForm';
import BetResultDisplay from '../components/BetResultDisplay';
import BankrollChart from '../components/BankrollChart';
import BetTable from '../components/BetTable';
import UserSettings from '../components/UserSettings';
import { calculateKelly } from '../utils/betCalculations';

const Dashboard = () => {
  // Mock data - replace with real data from your backend
  const mockBankrollData = [
    { date: '2024-01-01', balance: 1000 },
    { date: '2024-01-15', balance: 1200 },
    { date: '2024-02-01', balance: 1150 },
    { date: '2024-02-15', balance: 1400 },
  ];

  const mockStats = {
    roi: 40,
    winRate: 65.5,
    totalBets: 20,
  };

  const mockBets = [
    {
      date: '2024-02-15',
      matchTitle: 'Lakers vs Warriors',
      betType: 'Moneyline',
      odds: '+150',
      result: 'Won',
      units: 2.5,
      amount: 250,
      profitLoss: 375,
    },
    // Add more mock bets as needed
  ];

  const [showSettings, setShowSettings] = useState(false);
  const [betAnalysis, setBetAnalysis] = useState(null);
  const [settings, setSettings] = useState({
    initialBankroll: 1000,
    defaultKellyFraction: 'half',
    stopLossPercentage: 20,
    stopWinPercentage: 50,
    oddsFormat: 'american',
    maxBetPercentage: 10,
    maxConsecutiveLosses: 3,
    unitSizingEnabled: false,
    baseUnitSize: 100,
  });

  const handleCalculate = (formData) => {
    // Convert probability from percentage to decimal for calculation
    const probability = formData.probability / 100;
    
    // Real calculation using the Kelly Criterion
    const analysis = calculateKelly({
      probability,
      odds: formData.odds,
      oddsFormat: formData.oddsFormat,
      confidenceLevel: formData.confidenceLevel
    });
    
    // Add the original form data to the analysis for reference
    setBetAnalysis({
      ...analysis,
      matchTitle: formData.matchTitle,
      probability: formData.probability,
      odds: formData.odds,
      oddsFormat: formData.oddsFormat,
      confidenceLevel: formData.confidenceLevel,
    });
  };

  const handleSaveBet = (bet) => {
    // Handle saving bet to backend
    console.log('Saving bet:', bet);
    // For now, just show an alert that the bet was saved
    alert(`Bet for "${bet.matchTitle}" has been saved!`);
  };

  const handleSaveSettings = (updatedSettings) => {
    // Handle saving settings to backend
    console.log('Saving settings:', updatedSettings);
    setSettings(updatedSettings);
    setShowSettings(false);
    // For now, just show an alert that the settings were saved
    alert('Settings have been saved!');
  };

  const handleCancelSettings = () => {
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Smart Sports Betting Assistant</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <UserSettings
            settings={settings}
            onSave={handleSaveSettings}
            onCancel={handleCancelSettings}
          />
        ) : (
          <div className="space-y-8">
            {/* Top Row - Bet Input and Result */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <BetInputForm onCalculate={handleCalculate} defaultOddsFormat={settings.oddsFormat} />
                {betAnalysis && (
                  <BetResultDisplay
                    betAnalysis={betAnalysis}
                    onSave={handleSaveBet}
                    defaultKellyFraction={settings.defaultKellyFraction}
                    bankroll={settings.initialBankroll}
                    maxBetPercentage={settings.maxBetPercentage}
                  />
                )}
              </div>
              <div>
                <BankrollChart data={mockBankrollData} stats={mockStats} />
              </div>
            </div>

            {/* Bottom Row - Bet History Table */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Bet History</h2>
              <BetTable bets={mockBets} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Smart Sports Betting Assistant - Powered by Kelly Criterion
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 