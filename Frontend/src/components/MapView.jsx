import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_COLORS, LABEL_DISPLAY, WEATHER_DISPLAY, LABEL_ICONS } from '../data/constants';
import './MapView.css';

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

function TileLayerSwitcher({ layer }) {
  return <TileLayer url={TILE_LAYERS[layer].url} attribution={TILE_LAYERS[layer].attribution} />;
}

// Moves the map to the center of actual detections whenever they change
function AutoCenter({ detections }) {
  const map = useMap();

  useEffect(() => {
    const valid = detections.filter(d => d.lat != null && d.lon != null);
    if (valid.length === 0) return;

    const avgLat = valid.reduce((s, d) => s + d.lat, 0) / valid.length;
    const avgLon = valid.reduce((s, d) => s + d.lon, 0) / valid.length;
    map.setView([avgLat, avgLon], 13, { animate: true });
  }, [detections]);

  return null;
}

export default function MapView({ filters, onSelectDetection, detections = [] }) {
  const [tileLayer, setTileLayer] = useState('dark');

  // ── FIX 1: depend on both detections AND filters so map updates when data loads
  const filtered = useMemo(() => {
    return detections.filter((d) => {
      if (d.lat == null || d.lon == null) return false; // skip null GPS
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.label !== 'all' && d.label !== filters.label) return false;
      if (filters.weather !== 'all' && d.weather !== filters.weather) return false;
      return true;
    });
  }, [detections, filters]); // ← detections added here

  return (
    <div className="map-wrapper">
      <div className="map-controls">
        <div className="tile-switcher">
          {Object.keys(TILE_LAYERS).map((k) => (
            <button
              key={k}
              className={`tile-btn ${tileLayer === k ? 'active' : ''}`}
              onClick={() => setTileLayer(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <div className="map-legend">
          <span className="legend-dot" style={{ background: '#ef4444' }} /> Critical
          <span className="legend-dot" style={{ background: '#f59e0b' }} /> Warning
          <span className="legend-dot" style={{ background: '#22c55e' }} /> Compliant
        </div>
      </div>

      {/* ── FIX 2: center starts at [0,0] — AutoCenter moves it to real data ── */}
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayerSwitcher layer={tileLayer} />

        {/* Automatically pans to wherever the detections actually are */}
        <AutoCenter detections={detections} />

        {filtered.map((det) => (
          <CircleMarker
            key={det.id}
            center={[det.lat, det.lon]}
            radius={det.status === 'red' ? 9 : det.status === 'yellow' ? 7 : 6}
            pathOptions={{
              color: STATUS_COLORS[det.status],
              fillColor: STATUS_COLORS[det.status],
              fillOpacity: 0.85,
              weight: det.status === 'red' ? 2 : 1.5,
            }}
            eventHandlers={{ click: () => onSelectDetection(det) }}
          >
            <Popup className="retro-popup">
              <div className="popup-content">
                <div className="popup-header" style={{ borderColor: STATUS_COLORS[det.status] }}>
                  <span className="popup-icon">{LABEL_ICONS[det.label]}</span>
                  <div>
                    <div className="popup-title">{LABEL_DISPLAY[det.label]}</div>
                    <div className="popup-id">{det.id}</div>
                  </div>
                </div>
                {/* ── FIX 3: was det.riScore (camelCase mock) — API returns ri_score ── */}
                <div className="popup-row">
                  <span>RI Score</span>
                  <strong style={{ color: STATUS_COLORS[det.status] }}>
                    {det.ri_score ?? det.riScore} mcd/lx/m²
                  </strong>
                </div>
                <div className="popup-row">
                  <span>Status</span>
                  <strong style={{ color: STATUS_COLORS[det.status], textTransform: 'capitalize' }}>
                    {det.status}
                  </strong>
                </div>
                <div className="popup-row">
                  <span>Confidence</span>
                  <strong>{((det.confidence ?? 0) * 100).toFixed(0)}%</strong>
                </div>
                <div className="popup-row">
                  <span>Weather</span>
                  <strong>{WEATHER_DISPLAY[det.weather]}</strong>
                </div>
                {/* ── FIX 4: was det.kmMarker — API returns km_marker ── */}
                <div className="popup-row">
                  <span>KM Marker</span>
                  <strong>KM {det.km_marker ?? det.kmMarker ?? 'N/A'}</strong>
                </div>
                <div className="popup-row">
                  <span>GPS</span>
                  <strong>{det.lat}°, {det.lon}°</strong>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="map-count-badge">{filtered.length} detections shown</div>
    </div>
  );
}