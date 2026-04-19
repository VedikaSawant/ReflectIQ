import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiTarget } from 'react-icons/fi';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
          <FiTarget />
        </div>
        <div className="stat-info">
          <div className="stat-label">Total Signs Scanned</div>
          <div className="stat-value">{stats.total.toLocaleString()}</div>
          <div className="stat-change positive">+12% this month</div>
        </div>
      </div>

      <div className="stat-card" style={{ '--card-accent': 'var(--status-good)' }}>
        <div className="stat-icon" style={{ background: 'var(--status-good-bg)', color: 'var(--status-good)' }}>
          <FiCheckCircle />
        </div>
        <div className="stat-info">
          <div className="stat-label">Compliant Signs</div>
          <div className="stat-value">{stats.good.toLocaleString()}</div>
          <div className="stat-change">Above IRC thresholds</div>
        </div>
      </div>

      <div className="stat-card" style={{ '--card-accent': 'var(--status-warning)' }}>
        <div className="stat-icon" style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
          <FiAlertTriangle />
        </div>
        <div className="stat-info">
          <div className="stat-label">Degraded (Monitor)</div>
          <div className="stat-value">{stats.warning.toLocaleString()}</div>
          <div className="stat-change negative">+4% due to monsoon</div>
        </div>
      </div>

      <div className="stat-card" style={{ '--card-accent': 'var(--status-critical)' }}>
        <div className="stat-icon" style={{ background: 'var(--status-critical-bg)', color: 'var(--status-critical)' }}>
          <FiAlertOctagon />
        </div>
        <div className="stat-info">
          <div className="stat-label">Critical Failure</div>
          <div className="stat-value">{stats.critical.toLocaleString()}</div>
          <div className="stat-change negative">Immediate action required</div>
        </div>
      </div>
    </div>
  );
}
