import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { IRC_THRESHOLDS } from '../data/mockDetections';
import './AnalyticsPanel.css';

const STATUS_COLORS = { red: '#ef4444', yellow: '#f59e0b', green: '#22c55e' };
const LABEL_DISPLAY = {
  road_sign: 'Road Sign', lane_marking: 'Lane Marking',
  road_stud: 'Road Stud', delineator: 'Delineator',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPanel({ filters, detections = [] }) {
  const filtered = useMemo(() => {
    return detections.filter((d) => {
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.label !== 'all' && d.label !== filters.label) return false;
      if (filters.weather !== 'all' && d.weather !== filters.weather) return false;
      return true;
    });
  }, [filters]);

  // Bar chart: Avg RI by category with threshold line
  const barData = useMemo(() => {
    const groups = {};
    filtered.forEach((d) => {
      if (!groups[d.label]) groups[d.label] = [];
      groups[d.label].push(d.riScore);
    });
    return Object.entries(groups).map(([label, scores]) => ({
      name: LABEL_DISPLAY[label],
      avgRI: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      threshold: IRC_THRESHOLDS[label],
      count: scores.length,
    }));
  }, [filtered]);

  // Pie chart: status distribution
  const pieData = useMemo(() => {
    const counts = { red: 0, yellow: 0, green: 0 };
    filtered.forEach((d) => counts[d.status]++);
    return [
      { name: 'Critical', value: counts.red, color: '#ef4444' },
      { name: 'Warning', value: counts.yellow, color: '#f59e0b' },
      { name: 'Compliant', value: counts.green, color: '#22c55e' },
    ].filter((p) => p.value > 0);
  }, [filtered]);

  // Line chart: RI score trend along km markers (sorted, binned)
  const lineData = useMemo(() => {
    const bins = {};
    filtered.forEach((d) => {
      const km = Math.floor(d.kmMarker);
      if (!bins[km]) bins[km] = [];
      bins[km].push(d.riScore);
    });
    return Object.entries(bins)
      .sort(([a], [b]) => +a - +b)
      .map(([km, scores]) => ({
        km: `KM ${km}`,
        avgRI: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      }));
  }, [filtered]);

  return (
    <div className="analytics-panel">
      <div className="chart-section">
        <h3 className="chart-title">Avg RI Score by Category <span>vs IRC Threshold</span></h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgRI" name="Avg RI" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.avgRI < entry.threshold ? '#ef4444' : entry.avgRI < entry.threshold * 1.5 ? '#f59e0b' : '#22c55e'} />
              ))}
            </Bar>
            <Bar dataKey="threshold" name="IRC Min" fill="rgba(99,102,241,0.4)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section chart-row">
        <div className="chart-half">
          <h3 className="chart-title">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-half">
          <h3 className="chart-title">RI Trend Along Corridor</h3>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="km" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgRI" name="Avg RI" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
