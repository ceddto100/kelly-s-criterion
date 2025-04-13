import React from 'react';

const BetTypeSelector = ({ value, onChange }) => {
  const betTypes = [
    { value: 'spread', label: 'Point Spread' },
    { value: 'moneyline', label: 'Moneyline' },
    { value: 'total', label: 'Total (Over/Under)' },
    { value: 'prop', label: 'Prop Bet' }
  ];

  return (
    <div className="w-full">
      <label htmlFor="betType" className="block text-sm font-medium text-gray-700">
        Bet Type
      </label>
      <select
        id="betType"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {betTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BetTypeSelector; 