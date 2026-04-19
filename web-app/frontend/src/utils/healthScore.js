/**
 * Health Score Utilities
 * Converts raw retroreflectivity (Ra) values to health scores, colors, and labels
 * 
 * IRC Standards:
 * - White signs: Good > 50 cd/lux/m², Warning 35-50, Critical < 35
 * - Yellow signs: Good > 30 cd/lux/m², Warning 15-30, Critical < 15
 * - Red signs: Good > 7 cd/lux/m², Warning 3-7, Critical < 3
 */

const THRESHOLDS = {
  white: { good: 50, warning: 35 },
  yellow: { good: 30, warning: 15 },
  red: { good: 7, warning: 3 },
};

/**
 * Get health status from Ra value & sign color
 * @param {number} ra - Retroreflectivity value in cd/lux/m²
 * @param {string} signColor - 'white' | 'yellow' | 'red'
 * @returns {{ status: string, label: string, color: string, score: number }}
 */
export function getHealthFromRa(ra, signColor = 'white') {
  const t = THRESHOLDS[signColor] || THRESHOLDS.white;

  if (ra >= t.good) {
    return { status: 'good', label: 'Good', color: '#10b981', score: Math.min(100, Math.round((ra / (t.good * 2)) * 100)) };
  }
  if (ra >= t.warning) {
    return { status: 'warning', label: 'Degraded', color: '#f59e0b', score: Math.round(((ra - t.warning) / (t.good - t.warning)) * 50 + 30) };
  }
  return { status: 'critical', label: 'Critical', color: '#ef4444', score: Math.max(5, Math.round((ra / t.warning) * 30)) };
}

/**
 * Get color hex for map markers
 */
export function getMarkerColor(status) {
  const colors = {
    good: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
  };
  return colors[status] || colors.good;
}

/**
 * Calculate an overall health score from an array of sign data
 */
export function calculateOverallHealth(signs) {
  if (!signs.length) return 0;
  const scores = signs.map(s => getHealthFromRa(s.ra_value, s.sign_color).score);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Get aggregate counts by status
 */
export function getStatusCounts(signs) {
  const counts = { good: 0, warning: 0, critical: 0 };
  signs.forEach(sign => {
    const { status } = getHealthFromRa(sign.ra_value, sign.sign_color);
    counts[status]++;
  });
  return counts;
}

export default {
  getHealthFromRa,
  getMarkerColor,
  calculateOverallHealth,
  getStatusCounts,
};
