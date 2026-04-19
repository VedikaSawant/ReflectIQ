/**
 * Mock Data for NHAI RetroVision
 * Used for local development before Supabase integration
 * Covers highways across India with realistic retroreflectivity readings
 */

// Major Indian highways with sign data
export const mockSigns = [
  // NH-48 (Mumbai-Delhi Expressway corridor)
  { id: 'NH48-001', highway: 'NH-48', name: 'Speed Limit 100', type: 'Regulatory', sign_color: 'white', lat: 19.076, lng: 72.877, ra_value: 62, last_inspected: '2026-03-15', weather: 'Clear', km_marker: 12.5 },
  { id: 'NH48-002', highway: 'NH-48', name: 'No Overtaking', type: 'Regulatory', sign_color: 'white', lat: 19.155, lng: 72.849, ra_value: 45, last_inspected: '2026-03-10', weather: 'Rain', km_marker: 28.3 },
  { id: 'NH48-003', highway: 'NH-48', name: 'Curve Ahead', type: 'Warning', sign_color: 'yellow', lat: 19.230, lng: 72.855, ra_value: 12, last_inspected: '2026-02-20', weather: 'Fog', km_marker: 45.0 },
  { id: 'NH48-004', highway: 'NH-48', name: 'Exit Pune 15km', type: 'Informational', sign_color: 'white', lat: 19.395, lng: 72.920, ra_value: 55, last_inspected: '2026-03-18', weather: 'Clear', km_marker: 78.2 },
  { id: 'NH48-005', highway: 'NH-48', name: 'Speed Limit 80', type: 'Regulatory', sign_color: 'white', lat: 19.520, lng: 73.105, ra_value: 28, last_inspected: '2026-01-25', weather: 'Dust', km_marker: 105.7 },
  { id: 'NH48-006', highway: 'NH-48', name: 'Toll Plaza Ahead', type: 'Informational', sign_color: 'white', lat: 19.680, lng: 73.332, ra_value: 72, last_inspected: '2026-03-20', weather: 'Clear', km_marker: 142.0 },
  { id: 'NH48-007', highway: 'NH-48', name: 'Road Work', type: 'Warning', sign_color: 'yellow', lat: 19.850, lng: 73.510, ra_value: 8, last_inspected: '2026-01-05', weather: 'Rain', km_marker: 178.5 },

  // NH-44 (Delhi-Chennai corridor)
  { id: 'NH44-001', highway: 'NH-44', name: 'Speed Limit 120', type: 'Regulatory', sign_color: 'white', lat: 28.613, lng: 77.209, ra_value: 68, last_inspected: '2026-03-22', weather: 'Clear', km_marker: 5.0 },
  { id: 'NH44-002', highway: 'NH-44', name: 'Merge Ahead', type: 'Warning', sign_color: 'yellow', lat: 28.450, lng: 77.028, ra_value: 25, last_inspected: '2026-02-15', weather: 'Smog', km_marker: 32.8 },
  { id: 'NH44-003', highway: 'NH-44', name: 'No Entry', type: 'Regulatory', sign_color: 'red', lat: 28.210, lng: 76.850, ra_value: 4, last_inspected: '2026-01-10', weather: 'Fog', km_marker: 68.3 },
  { id: 'NH44-004', highway: 'NH-44', name: 'Hospital Ahead', type: 'Informational', sign_color: 'white', lat: 27.850, lng: 76.610, ra_value: 38, last_inspected: '2026-03-05', weather: 'Clear', km_marker: 125.0 },
  { id: 'NH44-005', highway: 'NH-44', name: 'Speed Limit 80', type: 'Regulatory', sign_color: 'white', lat: 27.180, lng: 76.420, ra_value: 52, last_inspected: '2026-03-12', weather: 'Clear', km_marker: 198.5 },
  { id: 'NH44-006', highway: 'NH-44', name: 'Pedestrian Crossing', type: 'Warning', sign_color: 'yellow', lat: 26.850, lng: 75.780, ra_value: 18, last_inspected: '2026-02-28', weather: 'Clear', km_marker: 265.0 },

  // NH-2 (Delhi-Kolkata corridor)
  { id: 'NH2-001', highway: 'NH-2', name: 'Speed Limit 100', type: 'Regulatory', sign_color: 'white', lat: 28.580, lng: 77.330, ra_value: 58, last_inspected: '2026-03-18', weather: 'Clear', km_marker: 15.0 },
  { id: 'NH2-002', highway: 'NH-2', name: 'Sharp Bend', type: 'Warning', sign_color: 'yellow', lat: 27.900, lng: 78.080, ra_value: 10, last_inspected: '2026-01-20', weather: 'Rain', km_marker: 95.0 },
  { id: 'NH2-003', highway: 'NH-2', name: 'Stop', type: 'Regulatory', sign_color: 'red', lat: 27.180, lng: 79.420, ra_value: 6, last_inspected: '2026-02-10', weather: 'Clear', km_marker: 220.0 },
  { id: 'NH2-004', highway: 'NH-2', name: 'Distance Marker', type: 'Informational', sign_color: 'white', lat: 26.450, lng: 80.350, ra_value: 42, last_inspected: '2026-03-08', weather: 'Dust', km_marker: 380.0 },
  { id: 'NH2-005', highway: 'NH-2', name: 'School Zone', type: 'Warning', sign_color: 'yellow', lat: 25.430, lng: 81.850, ra_value: 32, last_inspected: '2026-03-01', weather: 'Clear', km_marker: 520.0 },

  // NH-66 (Mumbai-Goa coastal highway)
  { id: 'NH66-001', highway: 'NH-66', name: 'Hairpin Turn', type: 'Warning', sign_color: 'yellow', lat: 18.520, lng: 73.100, ra_value: 9, last_inspected: '2026-01-15', weather: 'Rain', km_marker: 45.0 },
  { id: 'NH66-002', highway: 'NH-66', name: 'Speed Limit 60', type: 'Regulatory', sign_color: 'white', lat: 17.800, lng: 73.200, ra_value: 65, last_inspected: '2026-03-20', weather: 'Clear', km_marker: 130.0 },
  { id: 'NH66-003', highway: 'NH-66', name: 'Bridge Ahead', type: 'Informational', sign_color: 'white', lat: 16.850, lng: 73.300, ra_value: 33, last_inspected: '2026-02-25', weather: 'Monsoon', km_marker: 240.0 },
  { id: 'NH66-004', highway: 'NH-66', name: 'Landslide Zone', type: 'Warning', sign_color: 'yellow', lat: 15.760, lng: 73.520, ra_value: 14, last_inspected: '2026-02-05', weather: 'Rain', km_marker: 365.0 },
  { id: 'NH66-005', highway: 'NH-66', name: 'Goa Border', type: 'Informational', sign_color: 'white', lat: 15.410, lng: 73.880, ra_value: 70, last_inspected: '2026-03-22', weather: 'Clear', km_marker: 420.0 },

  // NH-8 (Ahmedabad corridor)
  { id: 'NH8-001', highway: 'NH-8', name: 'Speed Limit 100', type: 'Regulatory', sign_color: 'white', lat: 23.020, lng: 72.570, ra_value: 57, last_inspected: '2026-03-15', weather: 'Clear', km_marker: 8.0 },
  { id: 'NH8-002', highway: 'NH-8', name: 'Caution Animals', type: 'Warning', sign_color: 'yellow', lat: 22.850, lng: 72.380, ra_value: 22, last_inspected: '2026-02-18', weather: 'Dust', km_marker: 55.0 },
  { id: 'NH8-003', highway: 'NH-8', name: 'Service Area 5km', type: 'Informational', sign_color: 'white', lat: 22.500, lng: 72.100, ra_value: 75, last_inspected: '2026-03-25', weather: 'Clear', km_marker: 112.0 },
];

// Recent alerts
export const mockAlerts = [
  { id: 'ALT-001', signId: 'NH48-007', title: 'Critical: Road Work sign below threshold', highway: 'NH-48', km: 178.5, severity: 'high', timestamp: '2026-04-17T09:30:00Z', message: 'Ra dropped to 8 cd/lux/m² — immediate replacement needed' },
  { id: 'ALT-002', signId: 'NH48-003', title: 'Critical: Curve Ahead sign degraded', highway: 'NH-48', km: 45.0, severity: 'high', timestamp: '2026-04-17T08:15:00Z', message: 'Ra at 12 cd/lux/m² on yellow sign — safety hazard' },
  { id: 'ALT-003', signId: 'NH44-003', title: 'Critical: No Entry sign fading', highway: 'NH-44', km: 68.3, severity: 'high', timestamp: '2026-04-16T22:00:00Z', message: 'Red sign Ra at 4 cd/lux/m² — urgent replacement' },
  { id: 'ALT-004', signId: 'NH2-002', title: 'Warning: Sharp Bend sign degraded', highway: 'NH-2', km: 95.0, severity: 'medium', timestamp: '2026-04-16T18:30:00Z', message: 'Ra at 10 cd/lux/m² on yellow sign' },
  { id: 'ALT-005', signId: 'NH48-005', title: 'Warning: Speed Limit sign aging', highway: 'NH-48', km: 105.7, severity: 'medium', timestamp: '2026-04-16T14:00:00Z', message: 'Ra dropped to 28 cd/lux/m² — schedule maintenance' },
  { id: 'ALT-006', signId: 'NH66-001', title: 'Critical: Hairpin Turn sign failure', highway: 'NH-66', km: 45.0, severity: 'high', timestamp: '2026-04-16T11:00:00Z', message: 'Ra at 9 cd/lux/m² on curve warning — accident risk' },
  { id: 'ALT-007', signId: 'NH8-002', title: 'Warning: Caution Animals degraded', highway: 'NH-8', km: 55.0, severity: 'medium', timestamp: '2026-04-15T20:00:00Z', message: 'Ra at 22 cd/lux/m² — approaching threshold' },
  { id: 'ALT-008', signId: 'NH44-002', title: 'Warning: Merge sign aging', highway: 'NH-44', km: 32.8, severity: 'low', timestamp: '2026-04-15T16:00:00Z', message: 'Ra at 25 cd/lux/m² — monitor closely' },
];

// Predictions (simulated ML output)
export const mockPredictions = [
  { signId: 'NH48-005', name: 'Speed Limit 80', highway: 'NH-48', km: 105.7, predictedFailureDate: '2026-06-15', daysLeft: 59, confidence: 0.87, currentRa: 28 },
  { signId: 'NH44-006', name: 'Pedestrian Crossing', highway: 'NH-44', km: 265.0, predictedFailureDate: '2026-05-28', daysLeft: 41, confidence: 0.92, currentRa: 18 },
  { signId: 'NH66-004', name: 'Landslide Zone', highway: 'NH-66', km: 365.0, predictedFailureDate: '2026-05-10', daysLeft: 23, confidence: 0.95, currentRa: 14 },
  { signId: 'NH8-002', name: 'Caution Animals', highway: 'NH-8', km: 55.0, predictedFailureDate: '2026-07-20', daysLeft: 94, confidence: 0.78, currentRa: 22 },
  { signId: 'NH2-005', name: 'School Zone', highway: 'NH-2', km: 520.0, predictedFailureDate: '2026-08-05', daysLeft: 110, confidence: 0.65, currentRa: 32 },
  { signId: 'NH66-003', name: 'Bridge Ahead', highway: 'NH-66', km: 240.0, predictedFailureDate: '2026-06-30', daysLeft: 74, confidence: 0.82, currentRa: 33 },
];

// Historical trend data for charts
export const mockTrendData = [
  { month: 'Oct', scanned: 180, critical: 12, replaced: 8 },
  { month: 'Nov', scanned: 220, critical: 18, replaced: 14 },
  { month: 'Dec', scanned: 195, critical: 15, replaced: 11 },
  { month: 'Jan', scanned: 310, critical: 22, replaced: 20 },
  { month: 'Feb', scanned: 285, critical: 19, replaced: 16 },
  { month: 'Mar', scanned: 350, critical: 14, replaced: 13 },
  { month: 'Apr', scanned: 280, critical: 10, replaced: 9 },
];

// Distribution by sign type
export const mockTypeDistribution = [
  { type: 'Regulatory', count: 14, good: 8, warning: 3, critical: 3 },
  { type: 'Warning', count: 10, good: 2, warning: 3, critical: 5 },
  { type: 'Informational', count: 8, good: 6, warning: 2, critical: 0 },
];

// Highway timeline segments for Digital Twin
export const mockTimelineSegments = [
  { km_start: 0, km_end: 25, avgRa: 62, status: 'good', signs: 2, highway: 'NH-48' },
  { km_start: 25, km_end: 50, avgRa: 28, status: 'warning', signs: 2, highway: 'NH-48' },
  { km_start: 50, km_end: 80, avgRa: 55, status: 'good', signs: 1, highway: 'NH-48' },
  { km_start: 80, km_end: 110, avgRa: 28, status: 'critical', signs: 1, highway: 'NH-48' },
  { km_start: 110, km_end: 145, avgRa: 72, status: 'good', signs: 1, highway: 'NH-48' },
  { km_start: 145, km_end: 180, avgRa: 8, status: 'critical', signs: 1, highway: 'NH-48' },
  { km_start: 180, km_end: 200, avgRa: 50, status: 'good', signs: 0, highway: 'NH-48' },
];
