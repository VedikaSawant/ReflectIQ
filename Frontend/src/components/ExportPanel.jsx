import { STATUS_COLORS, LABEL_DISPLAY, WEATHER_DISPLAY } from '../data/constants';
import './ExportPanel.css';

export default function ExportPanel({ detections = [], summary }) {
  if (!summary) return null;

  function downloadCSV() {
    const headers = ['detection_id', 'label', 'ri_score', 'status', 'confidence', 'lat', 'lon', 'km_marker', 'weather', 'captured_at'];
    const rows = detections.map((d) => [
      d.id, d.label, d.riScore, d.status.toUpperCase(),
      d.confidence, d.lat, d.lon, d.kmMarker, d.weather, d.capturedAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retroscan_nh48_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(15, 17, 26);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(30, 30, 50);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(165, 180, 252);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RetroScan AI', 20, 22);

    doc.setTextColor(180, 180, 200);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NHAI Retroreflectivity Survey Report — NH-48 Pune Corridor', 20, 31);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 20, 38);

    // Summary Box
    doc.setFillColor(25, 27, 45);
    doc.roundedRect(15, 52, 180, 38, 4, 4, 'F');

    const stats = [
      ['Total km Surveyed', `${summary.totalKm || 19.4} km`],
      ['Total Detections', summary.totalDetections || 0],
      ['Critical (RED)', summary.critical || 0],
      ['Warning (YELLOW)', summary.warning || 0],
      ['Compliant (GREEN)', summary.compliant || 0],
      ['Avg RI Score', `${summary.avgRI || 0} mcd/lx/m²`],
    ];

    doc.setFontSize(8);
    stats.forEach(([label, val], i) => {
      const x = 20 + (i % 3) * 62;
      const y = 62 + Math.floor(i / 3) * 16;
      doc.setTextColor(120, 130, 160);
      doc.text(label, x, y);
      doc.setTextColor(220, 230, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(String(val), x, y + 7);
      doc.setFont('helvetica', 'normal');
    });

    // Top 10 Worst
    doc.setTextColor(165, 180, 252);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Critical Detections', 15, 102);

    const worst10 = [...detections].filter((d) => d.status === 'red').sort((a, b) => a.riScore - b.riScore).slice(0, 10);
    const colW = [22, 28, 22, 22, 28, 30, 28];
    const colX = [15, 37, 65, 87, 109, 137, 167];
    const headers = ['ID', 'Label', 'RI Score', 'Status', 'Weather', 'GPS', 'KM'];

    doc.setFillColor(35, 37, 60);
    doc.rect(15, 106, 180, 8, 'F');
    doc.setTextColor(120, 130, 160);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    headers.forEach((h, i) => doc.text(h, colX[i], 112));

    worst10.forEach((d, row) => {
      const y = 118 + row * 9;
      if (row % 2 === 0) {
        doc.setFillColor(22, 24, 40);
        doc.rect(15, y - 5, 180, 9, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 210, 240);
      const rowData = [
        d.id, LABEL_DISPLAY[d.label], `${d.riScore}`, 'RED',
        WEATHER_DISPLAY[d.weather].replace(/[^\w\s/]/g, '').trim(),
        `${d.lat}°N`, `KM ${d.kmMarker}`,
      ];
      rowData.forEach((val, i) => {
        if (i === 3) doc.setTextColor(239, 68, 68);
        else doc.setTextColor(200, 210, 240);
        doc.text(String(val), colX[i], y);
      });
    });

    // Footer
    doc.setFillColor(25, 27, 45);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(80, 90, 120);
    doc.setFontSize(8);
    doc.text('RetroScan AI — Powered by YOLOv8 + PyTorch | NHAI Compliance Report', 20, 290);

    doc.save('retroscan_nhai_report.pdf');
  }

  const critPct = (((summary.critical || 0) / Math.max(summary.totalDetections || 1, 1)) * 100).toFixed(1);
  const compPct = (((summary.compliant || 0) / Math.max(summary.totalDetections || 1, 1)) * 100).toFixed(1);

  return (
    <div className="export-panel">
      <div className="export-summary">
        <h3 className="export-heading">Survey Overview</h3>
        <div className="export-kpis">
          <div className="kpi-item">
            <div className="kpi-val" style={{ color: '#6366f1' }}>{summary.totalKm || 19.4} km</div>
            <div className="kpi-label">NH-48 Surveyed</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-val" style={{ color: '#ef4444' }}>{critPct}%</div>
            <div className="kpi-label">Critical Signs</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-val" style={{ color: '#22c55e' }}>{compPct}%</div>
            <div className="kpi-label">Compliant</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-val" style={{ color: '#0ea5e9' }}>{summary.avgRI || 0}</div>
            <div className="kpi-label">Avg RI (mcd/lx/m²)</div>
          </div>
        </div>
      </div>

      <div className="export-actions">
        <h3 className="export-heading">Export Reports</h3>
        <div className="export-cards">
          <div className="export-card" onClick={downloadCSV} id="export-csv-btn">
            <div className="export-card-icon">📄</div>
            <div className="export-card-info">
              <div className="export-card-title">Download CSV</div>
              <div className="export-card-desc">All {summary.totalDetections || 0} detections with GPS, RI scores, and status — for GIS/spreadsheet analysis</div>
            </div>
            <div className="export-arrow">↓</div>
          </div>
          <div className="export-card" onClick={downloadPDF} id="export-pdf-btn">
            <div className="export-card-icon">📋</div>
            <div className="export-card-info">
              <div className="export-card-title">Generate PDF Report</div>
              <div className="export-card-desc">One-page NHAI compliance summary with top 10 critical locations and executive stats</div>
            </div>
            <div className="export-arrow">↓</div>
          </div>
        </div>
      </div>

      <div className="irc-thresholds">
        <h3 className="export-heading">IRC Threshold Reference</h3>
        <div className="threshold-grid">
          {[
            { label: 'Road Sign', min: 70, unit: 'mcd/lx/m²', ref: 'IRC:67' },
            { label: 'Lane Marking', min: 100, unit: 'mcd/lx/m²', ref: 'IRC:35' },
            { label: 'Road Stud', min: 150, unit: 'mcd/lx/m²', ref: 'IRC:79' },
            { label: 'Delineator', min: 80, unit: 'mcd/lx/m²', ref: 'IRC:67' },
          ].map((t) => (
            <div className="threshold-row" key={t.label}>
              <div className="threshold-label">{t.label}</div>
              <div className="threshold-val">≥ {t.min} <span>{t.unit}</span></div>
              <div className="threshold-ref">{t.ref}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
