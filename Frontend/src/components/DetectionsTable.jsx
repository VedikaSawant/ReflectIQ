import { useState, useMemo } from 'react';
import { STATUS_COLORS, STATUS_BG, LABEL_DISPLAY, LABEL_ICONS, WEATHER_DISPLAY } from '../data/constants';
import './DetectionsTable.css';

const PAGE_SIZE = 12;

export default function DetectionsTable({ filters, onSelectDetection, detections = [] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = detections.filter((d) => {
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.label !== 'all' && d.label !== filters.label) return false;
      if (filters.weather !== 'all' && d.weather !== filters.weather) return false;
      return true;
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.id.includes(q) ||
          d.label.includes(q) ||
          d.status.includes(q) ||
          d.weather.includes(q) ||
          String(d.riScore).includes(q)
      );
    }
    return data;
  }, [filters, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h3 className="table-title">All Detections <span className="table-count">{filtered.length}</span></h3>
        <input
          className="table-search"
          placeholder="Search ID, label, status…"
          value={search}
          onChange={handleSearch}
          id="table-search-input"
        />
      </div>
      <div className="table-scroll">
        <table className="detections-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>ID</th>
              <th>Type</th>
              <th>RI Score</th>
              <th>Status</th>
              <th>Confidence</th>
              <th>Weather</th>
              <th>KM</th>
              <th>GPS</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((det) => (
              <tr key={det.id} className="table-row" onClick={() => onSelectDetection(det)}>
                <td className="img-cell">
                  {det.image_path ? (
                    <img src={`http://localhost:8000${det.image_path}`} alt="crop" className="table-thumb" />
                  ) : (
                    <div className="table-thumb-placeholder"></div>
                  )}
                </td>
                <td className="id-cell">{det.id}</td>
                <td>
                  <span className="label-chip">
                    {LABEL_ICONS[det.label]} {LABEL_DISPLAY[det.label]}
                  </span>
                </td>
                <td className="ri-cell" style={{ color: STATUS_COLORS[det.status] }}>
                  {det.riScore}
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      color: STATUS_COLORS[det.status],
                      background: STATUS_BG[det.status],
                      borderColor: STATUS_COLORS[det.status] + '40',
                    }}
                  >
                    {det.status.toUpperCase()}
                  </span>
                </td>
                <td>{(det.confidence * 100).toFixed(0)}%</td>
                <td className="weather-cell">{WEATHER_DISPLAY[det.weather]}</td>
                <td>KM {det.kmMarker}</td>
                <td className="gps-cell">{det.lat}°N</td>
                <td className="time-cell">
                  {new Date(det.capturedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span className="page-info">
          Page {page} of {totalPages} · {filtered.length} results
        </span>
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ← Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            );
          })}
          <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
