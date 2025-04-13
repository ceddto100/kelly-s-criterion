import React from 'react';

const ProbabilityProfileSelector = ({ value, onChange }) => {
  const profiles = [
    {
      value: 'balanced',
      label: 'Balanced',
      description: 'Equal weight to all factors'
    },
    {
      value: 'conservative',
      label: 'Conservative',
      description: 'Lower risk, more cautious approach'
    },
    {
      value: 'aggressive',
      label: 'Aggressive',
      description: 'Higher risk, more optimistic approach'
    }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Probability Profile
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.value}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              value === profile.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => onChange(profile.value)}
          >
            <div className="font-medium text-gray-900">{profile.label}</div>
            <div className="text-sm text-gray-500 mt-1">
              {profile.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProbabilityProfileSelector; 