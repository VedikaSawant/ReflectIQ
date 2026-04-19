/**
 * AI Engine Service
 * Calls the Python FastAPI backend for ML-based analysis
 * Falls back to mock responses in local dev mode
 */

const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/**
 * Analyze a sign image and return predicted Ra value + health
 */
export async function analyzeSignImage(file) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockRa = Math.round(Math.random() * 80 + 5);
        resolve({
          ra_value: mockRa,
          confidence: Math.round(Math.random() * 20 + 78) / 100,
          sign_type: ['Regulatory', 'Warning', 'Informational'][Math.floor(Math.random() * 3)],
          sign_color: ['white', 'yellow', 'red'][Math.floor(Math.random() * 3)],
          degradation_rate: (Math.random() * 5 + 1).toFixed(1),
          predicted_failure: new Date(Date.now() + Math.random() * 180 * 86400000).toISOString().split('T')[0],
        });
      }, 1500);
    });
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${AI_BASE}/analyze/image`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

/**
 * Get prediction for sign degradation
 */
export async function predictDegradation(signId, historicalData) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          signId,
          currentRa: historicalData?.currentRa || 40,
          predictedRa6Months: Math.max(5, (historicalData?.currentRa || 40) - Math.random() * 20),
          failureProbability: Math.round(Math.random() * 60 + 20) / 100,
          recommendedAction: Math.random() > 0.5 ? 'Schedule replacement' : 'Monitor closely',
        });
      }, 800);
    });
  }

  const response = await fetch(`${AI_BASE}/predict/degradation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signId, historicalData }),
  });
  return response.json();
}

export default { analyzeSignImage, predictDegradation };
