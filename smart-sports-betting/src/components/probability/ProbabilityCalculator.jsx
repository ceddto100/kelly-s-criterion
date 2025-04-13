import React, { useState } from 'react';
import ProbabilityFactorInput from './ProbabilityFactorInput';
import ProbabilityVisualization from './ProbabilityVisualization';
import ProbabilityProfileSelector from './ProbabilityProfileSelector';

const ProbabilityCalculator = () => {
  const [factors, setFactors] = useState({
    homeAdvantage: 0.05,
    recentForm: 0.1,
    headToHead: 0.15,
    injuries: -0.1,
    weather: 0.05
  });

  const [profile, setProfile] = useState('balanced');

  const calculateProbability = () => {
    // Base probability (50%)
    let probability = 0.5;

    // Apply factors based on selected profile
    Object.values(factors).forEach(factor => {
      probability += factor;
    });

    // Ensure probability stays within 0-1 range
    return Math.max(0, Math.min(1, probability));
  };

  const handleFactorChange = (factor, value) => {
    setFactors(prev => ({
      ...prev,
      [factor]: parseFloat(value)
    }));
  };

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
    // Apply profile-specific factor weights
    const profileWeights = {
      balanced: {
        homeAdvantage: 0.05,
        recentForm: 0.1,
        headToHead: 0.15,
        injuries: -0.1,
        weather: 0.05
      },
      conservative: {
        homeAdvantage: 0.03,
        recentForm: 0.05,
        headToHead: 0.1,
        injuries: -0.15,
        weather: 0.03
      },
      aggressive: {
        homeAdvantage: 0.08,
        recentForm: 0.15,
        headToHead: 0.2,
        injuries: -0.05,
        weather: 0.08
      }
    };
    setFactors(profileWeights[newProfile]);
  };

  const probability = calculateProbability();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Probability Calculator</h2>
        
        <ProbabilityProfileSelector
          value={profile}
          onChange={handleProfileChange}
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Adjust Factors</h3>
            <ProbabilityFactorInput
              factors={factors}
              onChange={handleFactorChange}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Probability Visualization</h3>
            <ProbabilityVisualization probability={probability} />
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Final Probability</h3>
          <div className="text-3xl font-bold text-indigo-600">
            {(probability * 100).toFixed(1)}%
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Based on selected factors and profile
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityCalculator; 