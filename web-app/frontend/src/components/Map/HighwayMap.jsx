import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getMarkerColor } from '../../utils/healthScore';

// Fix for default leaflet icons not showing in React
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

/**
 * Custom Colored Marker Icon
 */
const getCustomIcon = (status) => {
  const color = getMarkerColor(status);
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="36">
      <path fill="${color}" d="M12 0c-4.418 0-8 3.582-8 8s8 16 8 16 8-11.582 8-16-3.582-8-8-8zm0 12c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/>
    </svg>`;
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: svgIcon,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

export default function HighwayMap({ signs }) {
  // Center roughly on India
  const center = [22.0, 78.0];
  
  return (
    <div>
      <div className="map-wrapper">
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
          >
            {signs.map((sign) => {
              // Quick helper to get status
              const status = sign.ra_value < 35 && sign.sign_color === 'white' ? 'critical' : 
                             sign.ra_value >= 50 && sign.sign_color === 'white' ? 'good' : 
                             sign.ra_value < 15 && sign.sign_color === 'yellow' ? 'critical' :
                             sign.ra_value >= 30 && sign.sign_color === 'yellow' ? 'good' : 'warning';

              return (
                <Marker 
                  key={sign.id} 
                  position={[sign.lat, sign.lng]}
                  icon={getCustomIcon(status)}
                >
                  <Popup className="sign-popup">
                    <h3>{sign.name}</h3>
                    <div className="popup-row">
                      <span className="label">ID:</span>
                      <span className="value">{sign.id}</span>
                    </div>
                    <div className="popup-row">
                      <span className="label">Highway:</span>
                      <span className="value">{sign.highway} (KM {sign.km_marker})</span>
                    </div>
                    <div className="popup-row">
                      <span className="label">Ra Value:</span>
                      <span className="value" style={{ color: getMarkerColor(status) }}>
                        {sign.ra_value} cd/lux/m²
                      </span>
                    </div>
                    <div className="popup-row">
                      <span className="label">Last Insp:</span>
                      <span className="value">{sign.last_inspected}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#10b981' }}></div> Compliant (&gt;50)
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f59e0b' }}></div> Degraded (35-50)
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#ef4444' }}></div> Critical (&lt;35)
        </div>
      </div>
    </div>
  );
}
