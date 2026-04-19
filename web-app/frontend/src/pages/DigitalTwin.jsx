import React, { useState } from 'react';
import { mockTimelineSegments } from '../data/mockData';

export default function DigitalTwin() {
  const [activeHighway, setActiveHighway] = useState('NH-48');

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Linear Digital Twin</h1>
        <p>Module Phase 2 — 1D topological mapping of highway corridor assets.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className="twin-controls">
           {['NH-48', 'NH-44', 'NH-2', 'NH-66'].map(hw => (
             <button 
               key={hw}
               className={`twin-filter-btn ${activeHighway === hw ? 'active' : ''}`}
               onClick={() => setActiveHighway(hw)}
             >
               {hw} Corridor
             </button>
           ))}
        </div>

        <div className="twin-timeline">
           <div className="timeline-highway" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
             {mockTimelineSegments
               .filter(s => s.highway === activeHighway || activeHighway === 'NH-48') 
               .map((segment, idx) => (
                 <div key={idx} className="timeline-segment" onClick={() => alert(`View details for KM ${segment.km_start}-${segment.km_end}`)}>
                   <div className={`segment-bar ${segment.status}`}></div>
                   <div className="segment-label">Signs: {segment.signs}</div>
                   <div className="segment-km">KM {segment.km_start}-{segment.km_end}</div>
                   
                   {segment.status === 'critical' && (
                     <div style={{ position: 'absolute', top: '-15px', color: 'var(--status-critical)', fontSize: '1.2rem', animation: 'pulse 2s infinite' }}>
                       ⚠️
                     </div>
                   )}
                 </div>
               ))}
           </div>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
           <h3>Segment Intelligence</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a segment on the ribbon map above to view detailed deterioration physics, weather correlation models, and scheduling predictions.</p>
        </div>
      </div>
    </div>
  );
}
