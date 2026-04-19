import React, { useState, useEffect } from 'react';
import { FiFilter, FiActivity } from 'react-icons/fi';
import StatsBar from '../components/Dashboard/StatsBar';
import AlertFeed from '../components/Dashboard/AlertFeed';
import PredictionPanel from '../components/Dashboard/PredictionPanel';
import CostComparison from '../components/Dashboard/CostComparison';
import ReportDownload from '../components/Dashboard/ReportDownload';
import HighwayMap from '../components/Map/HighwayMap';
import useSignData from '../hooks/useSignData';
import useAlerts from '../hooks/useAlerts';
import { fetchStats, fetchPredictions } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  
  const { signs, loading: signsLoading } = useSignData({});
  const { alerts, loading: alertsLoading } = useAlerts();

  useEffect(() => {
    fetchStats().then(setStats);
    fetchPredictions().then(setPredictions);
  }, []);

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Intelligence Dashboard</h1>
        <p>Real-time analytics and predictive maintenance for highway signage.</p>
      </div>

      <StatsBar stats={stats} />

      <div className="dashboard-grid">
        <div className="glass-card full-width">
          <div className="section-header">
            <h2>Live Asset Map</h2>
            <div className="section-actions">
              <button className="btn btn-secondary btn-sm"><FiFilter /> Filters</button>
            </div>
          </div>
          {signsLoading ? <div>Loading map data...</div> : <HighwayMap signs={signs} />}
        </div>

        <div className="glass-card">
          <div className="section-header">
            <h2>Critical Alerts</h2>
            <div className="section-actions">
              <button className="btn btn-icon"><FiActivity /></button>
            </div>
          </div>
          {alertsLoading ? <div>Loading alerts...</div> : <AlertFeed alerts={alerts} />}
        </div>

        <div className="glass-card">
          <div className="section-header">
            <h2>AI Failure Predictions</h2>
          </div>
          <PredictionPanel predictions={predictions} />
        </div>

        <div className="glass-card full-width">
          <div className="section-header">
            <h2>Economic Impact Simulator (ROI)</h2>
          </div>
          <CostComparison stats={stats} />
        </div>
        
        <div className="glass-card full-width" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Generate Compliance Reports</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Export IRC-compliant documentation for audits and contractors.</p>
          </div>
          <ReportDownload />
        </div>
      </div>
    </div>
  );
}
