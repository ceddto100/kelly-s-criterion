import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';

const BetTable = ({ bets }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Match',
        accessor: 'matchTitle',
      },
      {
        Header: 'Bet Type',
        accessor: 'betType',
      },
      {
        Header: 'Odds',
        accessor: 'odds',
        Cell: ({ value, row }) => {
          const odds = parseFloat(value);
          return odds > 0 ? `+${odds}` : odds;
        },
      },
      {
        Header: 'Result',
        accessor: 'result',
        Cell: ({ value }) => {
          const resultColors = {
            won: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            push: 'bg-gray-100 text-gray-800',
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${resultColors[value.toLowerCase()]}`}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        Header: 'Units',
        accessor: 'units',
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }) => new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value),
      },
      {
        Header: 'P/L',
        accessor: 'profitLoss',
        Cell: ({ value }) => {
          const isPositive = value >= 0;
          return (
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                signDisplay: 'always',
              }).format(value)}
            </span>
          );
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter: setTableFilter,
  } = useTable(
    {
      columns,
      data: bets,
    },
    useGlobalFilter,
    useSortBy
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    setTableFilter(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={globalFilter}
            onChange={handleSearch}
            placeholder="Search bets..."
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.render('Header')}</span>
                      <span className="text-gray-400">
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' ↓'
                            : ' ↑'
                          : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {rows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No bets found</p>
        </div>
      )}
    </div>
  );
};

export default BetTable; 