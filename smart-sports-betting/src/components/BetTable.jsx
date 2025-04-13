import React, { useState } from 'react';

const BetTable = ({ bets = [] }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatOdds = (odds) => {
    if (typeof odds === 'number') {
      return odds > 0 ? `+${odds}` : odds.toString();
    }
    return odds;
  };

  const sortedBets = [...bets].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Convert dates to timestamps for comparison
    if (sortField === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string sorting
    return sortDirection === 'asc' 
      ? aValue.toString().localeCompare(bValue.toString()) 
      : bValue.toString().localeCompare(aValue.toString());
  });

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  if (bets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bets have been placed yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              onClick={() => handleSort('date')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Date {renderSortIcon('date')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Match
            </th>
            <th 
              onClick={() => handleSort('betType')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Bet Type {renderSortIcon('betType')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Odds
            </th>
            <th 
              onClick={() => handleSort('stake')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Stake {renderSortIcon('stake')}
            </th>
            <th 
              onClick={() => handleSort('outcome')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Result {renderSortIcon('outcome')}
            </th>
            <th 
              onClick={() => handleSort('profit')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Profit/Loss {renderSortIcon('profit')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBets.map((bet, index) => (
            <tr key={bet.id || index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bet.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {bet.team} vs {bet.opponent || 'Opponent'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bet.betType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatOdds(bet.odds)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${bet.stake}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${bet.outcome === 'Win' ? 'text-green-600' : 'text-red-600'}`}>
                {bet.outcome}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {bet.profit >= 0 ? `+$${bet.profit}` : `-$${Math.abs(bet.profit)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BetTable; 