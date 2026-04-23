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

// ── Derive a human-readable location label from GPS coordinates ──────────────
function getLocationLabel(detections) {
  const valid = detections.filter(d => d.lat != null && d.lon != null);
  if (valid.length === 0) return 'Location Unknown';

  const avgLat = valid.reduce((s, d) => s + d.lat, 0) / valid.length;
  const avgLon = valid.reduce((s, d) => s + d.lon, 0) / valid.length;

  // Rough bounding-box country/region detection
  if (avgLat >= 33 && avgLat <= 43 && avgLon >= 124 && avgLon <= 132) return 'South Korea';
  if (avgLat >= 8 && avgLat <= 37 && avgLon >= 68 && avgLon <= 97) return 'India';
  if (avgLat >= 35 && avgLat <= 72 && avgLon >= -10 && avgLon <= 40) return 'Europe';
  if (avgLat >= 24 && avgLat <= 50 && avgLon >= -125 && avgLon <= -65) return 'United States';
  if (avgLat >= -44 && avgLat <= -10 && avgLon >= 112 && avgLon <= 154) return 'Australia';

  // Fallback: show raw coordinates
  return `${avgLat.toFixed(4)}°, ${avgLon.toFixed(4)}°`;
}

// ── Compute surveyed km from max km_marker in detections ─────────────────────
function getTotalKm(detections) {
  if (!detections.length) return 0;
  const max = Math.max(...detections.map(d => d.km_marker ?? d.kmMarker ?? 0));
  return max > 0 ? parseFloat(max.toFixed(1)) : 0;
}

export default function App() {
  const [tab, setTab] = useState('map');
  const [filters, setFilters] = useState({ status: 'all', label: 'all', weather: 'all' });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [detections, setDetections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived from real data — no hardcoding
  const locationLabel = getLocationLabel(detections);
  const totalKm = getTotalKm(detections);

  useEffect(() => {
    fetch('http://localhost:8000/api/detections')
      .then(res => res.json())
      .then(data => {
        setDetections(data.detections);
        return fetch('http://localhost:8000/api/detections/summary');
      })
      .then(res => res.json())
      .then(sumData => {
        setSummary({
          totalKm: getTotalKm([]),   // will be overwritten by derived value
          totalDetections: sumData.total,
          critical: sumData.critical,
          warning: sumData.warning,
          compliant: sumData.compliant,
          avgRI: sumData.avg_ri,
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

  // Keep summary.totalKm in sync with real detections
  useEffect(() => {
    if (summary && detections.length > 0) {
      setSummary(s => ({ ...s, totalKm }));
    }
  }, [detections, totalKm]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const showFilters = tab === 'map' || tab === 'analytics' || tab === 'detections';

  // Breadcrumb: dynamic based on actual data
  const breadcrumb = detections.length > 0
    ? `${locationLabel} · KM 0 – ${totalKm}`
    : 'No survey data loaded';

  // Sidebar corridor info: dynamic
  const corridorInfo = detections.length > 0
    ? `${locationLabel} · ${new Date().toLocaleString('en-GB', { month: 'short', year: 'numeric' })}`
    : 'No data';

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
              {/* ── FIX 1: was hardcoded "NH-48 · Pune · Apr 2026" ── */}
              <div className="corridor-info">{corridorInfo}</div>
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
              {TABS.find((t) => t.id === tab)?.icon}&nbsp;{TABS.find((t) => t.id === tab)?.label}
            </h1>
            {/* ── FIX 2: was hardcoded "NH-48 Pune Corridor · KM 0 – 19.4" ── */}
            <div className="breadcrumb">{breadcrumb}</div>
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
        {/* ── FIX 3: summary.totalKm now comes from real data, not hardcoded 19.4 ── */}
        {loading
          ? <div style={{ padding: '20px' }}>Loading...</div>
          : <StatBar summary={{ ...summary, totalKm }} />
        }

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
                        <img
                          src={`http://localhost:8000${selectedDetection.image_path}`}
                          alt="Detection Crop"
                          className="detail-image"
                        />
                      </div>
                    )}
                    <div className="detail-id">{selectedDetection.id}</div>
                    <div
                      className="detail-status"
                      style={{
                        color: selectedDetection.status === 'red'
                          ? '#ef4444'
                          : selectedDetection.status === 'yellow'
                            ? '#f59e0b'
                            : '#22c55e',
                      }}
                    >
                      ● {selectedDetection.status.toUpperCase()}
                    </div>
                    <div className="detail-ri">
                      <span>RI Score</span>
                      <strong style={{
                        color: selectedDetection.status === 'red'
                          ? '#ef4444'
                          : selectedDetection.status === 'yellow'
                            ? '#f59e0b'
                            : '#22c55e',
                      }}>
                        {selectedDetection.ri_score ?? selectedDetection.riScore} mcd/lx/m²
                      </strong>
                    </div>
                    {[
                      ['Type', (selectedDetection.label ?? '').replace('_', ' ')],
                      ['Confidence', `${((selectedDetection.confidence ?? 0) * 100).toFixed(0)}%`],
                      ['Weather', (selectedDetection.weather ?? '').replace('_', ' ')],
                      ['KM Marker', `KM ${selectedDetection.km_marker ?? selectedDetection.kmMarker ?? 'N/A'}`],
                      ['Latitude', selectedDetection.lat != null ? `${selectedDetection.lat}°` : 'N/A'],
                      ['Longitude', selectedDetection.lon != null ? `${selectedDetection.lon}°` : 'N/A'],
                      ['Captured', new Date(selectedDetection.captured_at ?? selectedDetection.capturedAt).toLocaleString()],
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
          {tab === 'reports' && <ExportPanel detections={detections} summary={{ ...summary, totalKm }} />}
        </div>
      </main>
    </div>
  );
}