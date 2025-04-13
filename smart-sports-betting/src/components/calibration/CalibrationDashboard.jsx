import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useApi from '../../hooks/useApi';
import CalibrationCurve from './CalibrationCurve';
import BrierScoreDisplay from './BrierScoreDisplay';
import CalibrationRecommendations from './CalibrationRecommendations';
import SportSelector from '../common/SportSelector';
import BetTypeSelector from '../common/BetTypeSelector';
import mockCalibrationService from '../../services/mockCalibrationService';

const CalibrationDashboard = () => {
  const { currentUser } = useAuth();
  const api = useApi();
  const [sport, setSport] = useState('basketball');
  const [betType, setBetType] = useState('spread');
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCalibrationData();
  }, [sport, betType]);

  const loadCalibrationData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try to get data from the API
      try {
        const response = await api.get(`/api/calibration/metrics?sport=${sport}&betType=${betType}`);
        setMetrics(response.data.metrics);
        setRecommendations(response.data.recommendations);
      } catch (apiError) {
        console.log('API error, falling back to mock data', apiError);
        // If API fails, use mock data
        const mockData = await mockCalibrationService.getCalibrationMetrics(sport, betType);
        setMetrics(mockData.metrics);
        setRecommendations(mockData.recommendations);
      }
    } catch (error) {
      setError('Failed to load calibration data');
      console.error('Error loading calibration data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Probability Calibration Tracker</h2>
        
        {/* Sport and Bet Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <SportSelector value={sport} onChange={setSport} />
          <BetTypeSelector value={betType} onChange={setBetType} />
        </div>
        
        {metrics ? (
          <div className="space-y-6">
            {/* Brier Score Display */}
            <BrierScoreDisplay score={metrics.brierScore} />
            
            {/* Calibration Curve */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Calibration Curve</h3>
              <CalibrationCurve data={metrics.calibrationCurve} />
            </div>
            
            {/* Confidence Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-2">Overconfidence</h3>
                <div className="text-2xl font-bold text-red-600">
                  {(metrics.overconfidence * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-2">Underconfidence</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {(metrics.underconfidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            <CalibrationRecommendations recommendations={recommendations} />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No calibration data available. Start making predictions to see your calibration metrics.
          </div>
        )}
      </div>
    </div>
  );
};

export default CalibrationDashboard; 