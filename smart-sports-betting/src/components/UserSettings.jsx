import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserSettings = ({ settings = {}, onSave, onCancel }) => {
  const { userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const isStandalone = !onSave && !onCancel;
  
  // Initialize with props or user profile data
  const [formData, setFormData] = useState({
    bankroll: settings?.bankroll || userProfile?.bankroll || 1000,
    defaultKellyFraction: settings?.defaultKellyFraction || userProfile?.riskSettings?.defaultFractionMultiplier || 'half',
    stopLossPercentage: settings?.stopLossPercentage || (userProfile?.riskSettings?.stopLossPercentage || 0.2) * 100,
    stopWinPercentage: settings?.stopWinPercentage || (userProfile?.riskSettings?.stopWinPercentage || 0.5) * 100,
    oddsFormat: settings?.oddsFormat || userProfile?.preferences?.oddsFormat || 'american',
    maxBetPercentage: settings?.maxBetPercentage || (userProfile?.riskSettings?.maxBetPercentage || 0.05) * 100,
    maxConsecutiveLosses: settings?.maxConsecutiveLosses || userProfile?.riskSettings?.maxConsecutiveLosses || 3,
    unitSizingEnabled: settings?.unitSizingEnabled || userProfile?.riskSettings?.unitSizingEnabled || false,
    baseUnitSize: settings?.baseUnitSize || userProfile?.riskSettings?.baseUnitSize || 100,
  });

  // Log the received settings for debugging
  useEffect(() => {
    console.log('UserSettings received settings:', settings);
    console.log('UserSettings using userProfile:', userProfile);
  }, [settings, userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Saving settings:', formData);
    
    try {
      if (isStandalone) {
        // If component is used standalone, save directly to API/context
        // This would typically be an API call to update user settings
        console.log('Saving settings directly (standalone mode)');
        
        // TODO: Replace with actual API call when implemented
        // Example: await updateUserSettings(formData);
        
        // Refresh user profile after saving
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        
        // Redirect back to dashboard when done
        navigate('/dashboard');
      } else if (typeof onSave === 'function') {
        // If used as a modal/child component, call the provided onSave
        onSave(formData);
      } else {
        console.error('No save handler provided');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCancel = () => {
    if (isStandalone) {
      // Navigate back if used standalone
      navigate('/dashboard');
    } else if (typeof onCancel === 'function') {
      // Use provided onCancel if available
      onCancel();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <button 
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bankroll Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Bankroll Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bankroll
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="bankroll"
                  value={formData.bankroll}
                  onChange={handleInputChange}
                  className="pl-7 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Kelly Fraction
              </label>
              <select
                name="defaultKellyFraction"
                value={formData.defaultKellyFraction}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="full">Full Kelly</option>
                <option value="half">Half Kelly</option>
                <option value="quarter">Quarter Kelly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Risk Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Loss (% of bankroll)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="stopLossPercentage"
                  value={formData.stopLossPercentage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  max="100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Win (% of bankroll)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="stopWinPercentage"
                  value={formData.stopWinPercentage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  max="1000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Bet Size (% of bankroll)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="maxBetPercentage"
                  value={formData.maxBetPercentage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  max="100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Consecutive Losses
              </label>
              <input
                type="number"
                name="maxConsecutiveLosses"
                value={formData.maxConsecutiveLosses}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Display Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odds Format
              </label>
              <select
                name="oddsFormat"
                value={formData.oddsFormat}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="american">American (+150/-110)</option>
                <option value="decimal">Decimal (2.50)</option>
                <option value="fractional">Fractional (3/2)</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="unitSizingEnabled"
                  checked={formData.unitSizingEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Unit Sizing
                </label>
              </div>
              {formData.unitSizingEnabled && (
                <div className="flex-1">
                  <input
                    type="number"
                    name="baseUnitSize"
                    value={formData.baseUnitSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Base unit size"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-indigo-100 text-indigo-800 py-3 rounded-xl font-medium hover:bg-indigo-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings; 