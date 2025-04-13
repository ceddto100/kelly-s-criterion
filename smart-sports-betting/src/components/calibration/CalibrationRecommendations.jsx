import React from 'react';

const CalibrationRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 border-red-400';
      case 'medium':
        return 'text-amber-600 border-amber-400';
      case 'low':
        return 'text-green-600 border-green-400';
      default:
        return 'text-gray-600 border-gray-400';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50';
      case 'medium':
        return 'bg-amber-50';
      case 'low':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Recommendations</h3>
      <div className="space-y-5">
        {recommendations.map((rec, index) => (
          <div 
            key={index} 
            className={`border-l-4 ${getSeverityColor(rec.severity)} p-4 rounded-r-md ${getSeverityBg(rec.severity)}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h4 className={`font-medium ${rec.severity === 'high' ? 'text-red-700' : rec.severity === 'medium' ? 'text-amber-700' : 'text-green-700'}`}>
                {rec.description}
              </h4>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSeverityBg(rec.severity)} border ${getSeverityColor(rec.severity)}`}>
                {rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)} Priority
              </span>
            </div>
            <p className="text-gray-700 text-sm">{rec.suggestedAction}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalibrationRecommendations; 