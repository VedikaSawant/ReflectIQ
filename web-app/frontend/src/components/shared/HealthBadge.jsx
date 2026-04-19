import React from 'react';
import { getHealthFromRa } from '../../utils/healthScore';

export default function HealthBadge({ ra, signColor = 'white' }) {
  const health = getHealthFromRa(ra, signColor);
  
  return (
    <span className={`health-badge ${health.status}`}>
      <div className="badge-dot"></div>
      {health.label}
    </span>
  );
}
