import React from 'react';
import { FiClock } from 'react-icons/fi';

export default function AlertFeed({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <h3>No alerts right now</h3>
        <p>All scanned signs are operating safely.</p>
      </div>
    );
  }

  // Helper to format time nicely
  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="alert-feed">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-item">
          <div className={`alert-severity ${alert.severity}`}></div>
          <div className="alert-content">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-meta">
              <span>{alert.highway} - KM {alert.km}</span>
              <span className="alert-time">
                <FiClock /> {formatTime(alert.timestamp)}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {alert.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
