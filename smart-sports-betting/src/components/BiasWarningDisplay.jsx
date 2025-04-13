import React from 'react';
import PropTypes from 'prop-types';
import { getBiasSeverityColor } from '../utils/regressionUtils';

/**
 * Component for displaying cognitive bias warnings
 */
const BiasWarningDisplay = ({ biases = [] }) => {
  if (!biases || biases.length === 0) {
    return null;
  }

  // Get icons for bias types
  const getBiasIcon = (biasType) => {
    switch (biasType) {
      case 'recencyBias':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
      case 'hotHandFallacy':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05c-.31.071-.535.699-.535 1.207v.65c0 .907.073 1.846.573 2.533.498.688 1.256 1.055 2.012 1.055.545 0 1.054-.14 1.502-.42a4.998 4.998 0 003.522-2.778 1 1 0 00-.327-1.24z" clipRule="evenodd" />
            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM14.918 14.254a8.287 8.287 0 011.308 5.135 9.687 9.687 0 001.764-.44l.115-.04a.563.563 0 00.373-.487l.01-.121a3.75 3.75 0 00-3.57-4.047z" />
          </svg>
        );
      case 'gamblersFallacy':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      case 'smallSampleSize':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Get the title for the bias container
  const getContainerTitle = () => {
    if (biases.length === 1) {
      return "Potential Cognitive Bias Detected";
    } else {
      return `${biases.length} Potential Cognitive Biases Detected`;
    }
  };

  // Sort biases by severity
  const sortedBiases = [...biases].sort((a, b) => b.severity - a.severity);

  return (
    <div className="border border-yellow-200 rounded-lg bg-yellow-50 p-4">
      <div className="flex items-center mb-3">
        <svg className="w-6 h-6 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-semibold text-yellow-800">{getContainerTitle()}</h3>
      </div>
      
      <div className="space-y-3">
        {sortedBiases.map((bias, index) => (
          <div 
            key={`bias-${index}`} 
            className="flex items-start p-3 border border-yellow-200 rounded-md bg-white"
          >
            <div className="flex-shrink-0 mr-3">
              <div 
                className="p-2 rounded-full" 
                style={{ 
                  backgroundColor: `${getBiasSeverityColor(bias.severity)}20`,
                  color: getBiasSeverityColor(bias.severity)
                }}
              >
                {getBiasIcon(bias.type)}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">{bias.description}</h4>
                <div 
                  className="text-xs px-2 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: `${getBiasSeverityColor(bias.severity)}20`,
                    color: getBiasSeverityColor(bias.severity)
                  }}
                >
                  {bias.severity >= 0.8 ? 'High' : bias.severity >= 0.5 ? 'Medium' : 'Low'} Risk
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{bias.explanation}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600 flex items-start">
        <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
        <p>
          Being aware of these cognitive biases can help you make more objective probability estimates. 
          Consider adjusting your estimates to account for these potential biases.
        </p>
      </div>
    </div>
  );
};

BiasWarningDisplay.propTypes = {
  biases: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    explanation: PropTypes.string.isRequired,
    severity: PropTypes.number.isRequired
  }))
};

export default BiasWarningDisplay; 