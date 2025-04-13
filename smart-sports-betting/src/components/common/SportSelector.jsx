import React from 'react';

const SportSelector = ({ value, onChange }) => {
  const sports = [
    { value: 'basketball', label: 'Basketball' },
    { value: 'football', label: 'Football' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'hockey', label: 'Hockey' }
  ];

  return (
    <div className="w-full">
      <label htmlFor="sport" className="block text-sm font-medium text-gray-700">
        Sport
      </label>
      <select
        id="sport"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {sports.map((sport) => (
          <option key={sport.value} value={sport.value}>
            {sport.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SportSelector; 