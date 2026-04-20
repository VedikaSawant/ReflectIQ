// Mock detections along NH-48 Pune corridor (18.52–18.57°N, 73.85–73.95°E)
const WEATHER_CONDITIONS = ['day_dry', 'day_wet', 'night_dry', 'night_wet', 'foggy'];
const LABELS = ['road_sign', 'lane_marking', 'road_stud', 'delineator'];

const IRC_THRESHOLDS = {
  road_sign: 70,
  lane_marking: 100,
  road_stud: 150,
  delineator: 80,
};

function classifyRI(score, label) {
  const low = IRC_THRESHOLDS[label];
  if (score < low) return 'red';
  if (score < low * 1.5) return 'yellow';
  return 'green';
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateMockDetections(count = 95) {
  const rand = seededRandom(42);
  const detections = [];

  for (let i = 0; i < count; i++) {
    const label = LABELS[Math.floor(rand() * LABELS.length)];
    const weather = WEATHER_CONDITIONS[Math.floor(rand() * WEATHER_CONDITIONS.length)];
    const kmMarker = +(1 + rand() * 18).toFixed(1);
    const lat = +(18.52 + rand() * 0.05).toFixed(5);
    const lon = +(73.856 + rand() * 0.094).toFixed(5);

    // Night/wet conditions reduce RI
    let baseRI;
    if (label === 'road_sign') baseRI = 30 + rand() * 120;
    else if (label === 'lane_marking') baseRI = 50 + rand() * 160;
    else if (label === 'road_stud') baseRI = 80 + rand() * 250;
    else baseRI = 40 + rand() * 130;

    const weatherPenalty = weather.includes('night') ? 0.7 : weather === 'foggy' ? 0.75 : weather.includes('wet') ? 0.85 : 1.0;
    const riScore = +(baseRI * weatherPenalty).toFixed(1);
    const status = classifyRI(riScore, label);

    const date = new Date('2026-04-17T18:00:00');
    date.setMinutes(date.getMinutes() + Math.floor(rand() * 240));

    detections.push({
      id: `det-${String(i + 1).padStart(3, '0')}`,
      label,
      confidence: +(0.72 + rand() * 0.27).toFixed(2),
      riScore,
      status,
      weather,
      lat,
      lon,
      kmMarker,
      capturedAt: date.toISOString(),
    });
  }

  return detections;
}

export const DETECTIONS = generateMockDetections(95);

export const SUMMARY_STATS = {
  totalKm: 19.4,
  totalDetections: DETECTIONS.length,
  critical: DETECTIONS.filter((d) => d.status === 'red').length,
  warning: DETECTIONS.filter((d) => d.status === 'yellow').length,
  compliant: DETECTIONS.filter((d) => d.status === 'green').length,
  avgRI: +(DETECTIONS.reduce((s, d) => s + d.riScore, 0) / DETECTIONS.length).toFixed(1),
};

export { IRC_THRESHOLDS };
