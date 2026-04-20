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
  const map = useMap();
  return <TileLayer url={TILE_LAYERS[layer].url} attribution={TILE_LAYERS[layer].attribution} />;
}

export default function MapView({ filters, onSelectDetection, detections = [] }) {
  const [tileLayer, setTileLayer] = useState('dark');

  const filtered = useMemo(() => {
    return detections.filter((d) => {
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.label !== 'all' && d.label !== filters.label) return false;
      if (filters.weather !== 'all' && d.weather !== filters.weather) return false;
      return true;
    });
  }, [filters]);

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

      <MapContainer
        center={[18.542, 73.903]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayerSwitcher layer={tileLayer} />
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
                <div className="popup-row">
                  <span>RI Score</span>
                  <strong style={{ color: STATUS_COLORS[det.status] }}>{det.riScore} mcd/lx/m²</strong>
                </div>
                <div className="popup-row">
                  <span>Status</span>
                  <strong style={{ color: STATUS_COLORS[det.status], textTransform: 'capitalize' }}>{det.status}</strong>
                </div>
                <div className="popup-row">
                  <span>Confidence</span>
                  <strong>{(det.confidence * 100).toFixed(0)}%</strong>
                </div>
                <div className="popup-row">
                  <span>Weather</span>
                  <strong>{WEATHER_DISPLAY[det.weather]}</strong>
                </div>
                <div className="popup-row">
                  <span>KM Marker</span>
                  <strong>KM {det.kmMarker}</strong>
                </div>
                <div className="popup-row">
                  <span>GPS</span>
                  <strong>{det.lat}°N, {det.lon}°E</strong>
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
