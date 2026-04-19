/**
 * API Service Layer
 * All HTTP calls to the backend go through here.
 * Switches between mock data (local) and live backend.
 */
import axios from 'axios';
import { mockSigns, mockAlerts, mockPredictions, mockTrendData, mockTypeDistribution } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // default to mock

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Signs ──────────────────────────────────────────────────────
export async function fetchSigns(filters = {}) {
  if (USE_MOCK) {
    let signs = [...mockSigns];
    if (filters.highway) signs = signs.filter(s => s.highway === filters.highway);
    if (filters.status) {
      // filter by health status would require healthScore util, keeping it simple
      signs = signs.filter(s => {
        if (filters.status === 'critical') return s.ra_value < 35;
        if (filters.status === 'warning') return s.ra_value >= 35 && s.ra_value < 50;
        return s.ra_value >= 50;
      });
    }
    return signs;
  }
  const { data } = await api.get('/signs', { params: filters });
  return data;
}

export async function fetchSignById(id) {
  if (USE_MOCK) return mockSigns.find(s => s.id === id) || null;
  const { data } = await api.get(`/signs/${id}`);
  return data;
}

// ── Alerts ─────────────────────────────────────────────────────
export async function fetchAlerts() {
  if (USE_MOCK) return mockAlerts;
  const { data } = await api.get('/alerts');
  return data;
}

// ── Predictions ────────────────────────────────────────────────
export async function fetchPredictions() {
  if (USE_MOCK) return mockPredictions;
  const { data } = await api.get('/predictions');
  return data;
}

// ── Stats ──────────────────────────────────────────────────────
export async function fetchStats() {
  if (USE_MOCK) {
    const total = mockSigns.length;
    const critical = mockSigns.filter(s => s.ra_value < 35).length;
    const warning = mockSigns.filter(s => s.ra_value >= 35 && s.ra_value < 50).length;
    const good = total - critical - warning;
    const avgRa = Math.round(mockSigns.reduce((a, s) => a + s.ra_value, 0) / total);
    return { total, critical, warning, good, avgRa, highways: [...new Set(mockSigns.map(s => s.highway))].length };
  }
  const { data } = await api.get('/stats');
  return data;
}

// ── Trend Data ─────────────────────────────────────────────────
export async function fetchTrends() {
  if (USE_MOCK) return mockTrendData;
  const { data } = await api.get('/trends');
  return data;
}

// ── Type Distribution ──────────────────────────────────────────
export async function fetchTypeDistribution() {
  if (USE_MOCK) return mockTypeDistribution;
  const { data } = await api.get('/distribution');
  return data;
}

// ── Upload ─────────────────────────────────────────────────────
export async function uploadImage(file, metadata = {}) {
  const formData = new FormData();
  formData.append('image', file);
  Object.entries(metadata).forEach(([k, v]) => formData.append(k, v));

  if (USE_MOCK) {
    // Simulate upload delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          signId: 'MOCK-' + Date.now(),
          ra_value: Math.round(Math.random() * 80 + 5),
          confidence: Math.round(Math.random() * 30 + 70) / 100,
        });
      }, 2000);
    });
  }

  const { data } = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  if (USE_MOCK) {
    // Simulate upload with progress
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          onProgress?.(100);
          setTimeout(() => {
            resolve({
              success: true,
              signsDetected: Math.floor(Math.random() * 10 + 3),
              processedFrames: Math.floor(Math.random() * 500 + 100),
            });
          }, 500);
        } else {
          onProgress?.(Math.round(progress));
        }
      }, 300);
    });
  }

  const { data } = await api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const pct = Math.round((e.loaded * 100) / e.total);
      onProgress?.(pct);
    },
  });
  return data;
}

// ── Reports ────────────────────────────────────────────────────
export async function downloadReport(format = 'pdf') {
  if (USE_MOCK) {
    alert(`[Mock] Downloading ${format.toUpperCase()} report...`);
    return;
  }
  const response = await api.get(`/reports/download?format=${format}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `nhai_report.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default api;
