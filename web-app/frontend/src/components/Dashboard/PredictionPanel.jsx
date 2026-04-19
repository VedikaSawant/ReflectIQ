import React from 'react';
import { FiTrendingDown } from 'react-icons/fi';

export default function PredictionPanel({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="prediction-list">
      {predictions.slice(0, 4).map((pred) => (
        <div key={pred.signId} className="prediction-item">
          <div className="prediction-icon" style={{ background: 'var(--accent-orange-dim)', color: 'var(--accent-orange)' }}>
            <FiTrendingDown />
          </div>
          <div className="prediction-info">
            <div className="pred-name">{pred.name}</div>
            <div className="pred-highway">{pred.highway} • KM {pred.km}</div>
          </div>
          <div className="prediction-date">
            <div className="date-value">{formatDate(pred.predictedFailureDate)}</div>
            <div className="days-left">{pred.daysLeft} days left</div>
          </div>
        </div>
      ))}
    </div>
  );
}
