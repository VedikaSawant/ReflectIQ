import './StatBar.css';

export default function StatBar({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      label: 'Total km Surveyed',
      value: `${summary.totalKm || 0} km`,
      sub: 'NH-48 Pune Corridor',
      icon: '🛣️',
      accent: '#6366f1',
    },
    {
      label: 'Critical',
      value: summary.critical || 0,
      sub: `${(((summary.critical || 0) / Math.max(summary.totalDetections || 1, 1)) * 100).toFixed(1)}% of total`,
      icon: '🔴',
      accent: '#ef4444',
    },
    {
      label: 'Warning',
      value: summary.warning || 0,
      sub: `${(((summary.warning || 0) / Math.max(summary.totalDetections || 1, 1)) * 100).toFixed(1)}% of total`,
      icon: '🟡',
      accent: '#f59e0b',
    },
    {
      label: 'Compliant',
      value: summary.compliant || 0,
      sub: `${(((summary.compliant || 0) / Math.max(summary.totalDetections || 1, 1)) * 100).toFixed(1)}% of total`,
      icon: '🟢',
      accent: '#22c55e',
    },
    {
      label: 'Avg RI Score',
      value: `${summary.avgRI || 0}`,
      sub: 'mcd/lx/m²',
      icon: '📊',
      accent: '#0ea5e9',
    },
  ];

  return (
    <div className="stat-bar">
      {cards.map((c) => (
        <div className="stat-card" key={c.label} style={{ '--accent': c.accent }}>
          <div className="stat-icon">{c.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
          <div className="stat-glow" />
        </div>
      ))}
    </div>
  );
}
