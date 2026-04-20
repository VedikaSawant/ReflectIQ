import { useState, useEffect } from 'react';
import StatBar from './components/StatBar';
import MapView from './components/MapView';
import AnalyticsPanel from './components/AnalyticsPanel';
import DetectionsTable from './components/DetectionsTable';
import ExportPanel from './components/ExportPanel';
import './App.css';

const TABS = [
  { id: 'map', label: 'Map View', icon: '🗺️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'detections', label: 'Detections', icon: '🔍' },
  { id: 'reports', label: 'Reports', icon: '📋' },
];

const STATUS_OPTIONS = ['all', 'red', 'yellow', 'green'];
const LABEL_OPTIONS = ['all', 'road_sign', 'lane_marking', 'road_stud', 'delineator'];
const WEATHER_OPTIONS = ['all', 'day_dry', 'day_wet', 'night_dry', 'night_wet', 'foggy'];

const WEATHER_LABEL = {
  all: 'All Weather', day_dry: '☀️ Day/Dry', day_wet: '🌧️ Day/Wet',
  night_dry: '🌙 Night/Dry', night_wet: '⛈️ Night/Wet', foggy: '🌫️ Foggy',
};
const LABEL_LABEL = {
  all: 'All Types', road_sign: '🚧 Road Sign', lane_marking: '〰️ Lane Marking',
  road_stud: '💡 Road Stud', delineator: '🔶 Delineator',
};
const STATUS_LABEL = {
  all: 'All Status', red: '🔴 Critical', yellow: '🟡 Warning', green: '🟢 Compliant',
};

export default function App() {
  const [tab, setTab] = useState('map');
  const [filters, setFilters] = useState({ status: 'all', label: 'all', weather: 'all' });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [detections, setDetections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from real backend
    fetch('http://localhost:8000/api/detections')
      .then(res => res.json())
      .then(data => {
        setDetections(data.detections);
        return fetch('http://localhost:8000/api/detections/summary');
      })
      .then(res => res.json())
      .then(sumData => {
        setSummary({
          totalKm: 19.4,
          totalDetections: sumData.total,
          critical: sumData.critical,
          warning: sumData.warning,
          compliant: sumData.compliant,
          avgRI: sumData.avg_ri
        });
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend not running, falling back to mock data");
        import('./data/mockDetections').then(mock => {
          setDetections(mock.DETECTIONS);
          setSummary(mock.SUMMARY_STATS);
          setLoading(false);
        });
      });
  }, []);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const showFilters = tab === 'map' || tab === 'analytics' || tab === 'detections';

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">RS</div>
          {sidebarOpen && (
            <div className="logo-text">
              <span className="logo-name">RetroScan AI</span>
              <span className="logo-sub">NHAI Dashboard</span>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen((o) => !o)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              title={t.label}
              id={`nav-${t.id}`}
            >
              <span className="nav-icon">{t.icon}</span>
              {sidebarOpen && <span className="nav-label">{t.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <>
              <div className="survey-badge">
                <span className="badge-dot pulse" />
                <span>Live Survey Active</span>
              </div>
              <div className="corridor-info">NH-48 · Pune · Apr 2026</div>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {TABS.find((t) => t.id === tab)?.icon}&nbsp; {TABS.find((t) => t.id === tab)?.label}
            </h1>
            <div className="breadcrumb">NH-48 Pune Corridor · KM 0 – 19.4</div>
          </div>
          {showFilters && (
            <div className="filter-bar">
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                id="filter-status"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{STATUS_LABEL[o]}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={filters.label}
                onChange={(e) => setFilter('label', e.target.value)}
                id="filter-label"
              >
                {LABEL_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABEL_LABEL[o]}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={filters.weather}
                onChange={(e) => setFilter('weather', e.target.value)}
                id="filter-weather"
              >
                {WEATHER_OPTIONS.map((o) => (
                  <option key={o} value={o}>{WEATHER_LABEL[o]}</option>
                ))}
              </select>
              {(filters.status !== 'all' || filters.label !== 'all' || filters.weather !== 'all') && (
                <button
                  className="clear-filters-btn"
                  onClick={() => setFilters({ status: 'all', label: 'all', weather: 'all' })}
                  id="clear-filters-btn"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          )}
        </header>

        {/* Stats */}
        {loading ? <div style={{padding: '20px'}}>Loading...</div> : <StatBar summary={summary} />}

        {/* Content */}
        <div className="content-area">
          {tab === 'map' && (
            <div className="map-layout">
              <div className="map-main">
                <MapView filters={filters} onSelectDetection={setSelectedDetection} detections={detections} />
              </div>
              {selectedDetection && (
                <div className="detail-panel">
                  <div className="detail-header">
                    <span>Detection Detail</span>
                    <button className="detail-close" onClick={() => setSelectedDetection(null)}>✕</button>
                  </div>
                  <div className="detail-body">
                    {selectedDetection.image_path && (
                      <div className="detail-image-wrapper">
                        <img src={`http://localhost:8000${selectedDetection.image_path}`} alt="Detection Crop" className="detail-image" />
                      </div>
                    )}
                    <div className="detail-id">{selectedDetection.id}</div>
                    <div
                      className="detail-status"
                      style={{
                        color: selectedDetection.status === 'red' ? '#ef4444' : selectedDetection.status === 'yellow' ? '#f59e0b' : '#22c55e',
                      }}
                    >
                      ● {selectedDetection.status.toUpperCase()}
                    </div>
                    <div className="detail-ri">
                      <span>RI Score</span>
                      <strong style={{ color: selectedDetection.status === 'red' ? '#ef4444' : selectedDetection.status === 'yellow' ? '#f59e0b' : '#22c55e' }}>
                        {selectedDetection.riScore} mcd/lx/m²
                      </strong>
                    </div>
                    {[
                      ['Type', selectedDetection.label.replace('_', ' ')],
                      ['Confidence', `${(selectedDetection.confidence * 100).toFixed(0)}%`],
                      ['Weather', selectedDetection.weather.replace('_', ' ')],
                      ['KM Marker', `KM ${selectedDetection.kmMarker}`],
                      ['Latitude', `${selectedDetection.lat}°N`],
                      ['Longitude', `${selectedDetection.lon}°E`],
                      ['Captured', new Date(selectedDetection.capturedAt).toLocaleString('en-IN')],
                    ].map(([k, v]) => (
                      <div className="detail-row" key={k}>
                        <span>{k}</span><strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 'analytics' && <AnalyticsPanel filters={filters} detections={detections} />}
          {tab === 'detections' && (
            <DetectionsTable filters={filters} onSelectDetection={setSelectedDetection} detections={detections} />
          )}
          {tab === 'reports' && <ExportPanel detections={detections} summary={summary} />}
        </div>
      </main>
    </div>
  );
}
