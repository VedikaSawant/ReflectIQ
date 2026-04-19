import React, { useState } from 'react';
import ImageUpload from '../components/Upload/ImageUpload';
import VideoUpload from '../components/Upload/VideoUpload';
import useUpload from '../hooks/useUpload';
import HealthBadge from '../components/shared/HealthBadge';

export default function FieldView() {
  const { uploading, progress, result, error, handleImageUpload, handleVideoUpload, reset } = useUpload();
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'video'
  const [previewUrl, setPreviewUrl] = useState(null);

  const onDropImage = async (file) => {
    setPreviewUrl(URL.createObjectURL(file));
    await handleImageUpload(file);
  };

  const onDropVideo = async (file) => {
    // Basic preview info
    setPreviewUrl('video');
    await handleVideoUpload(file);
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Field Operations Hub</h1>
        <p>Instantly evaluate sign compliance via edge inference.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            className={`btn ${activeTab === 'image' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('image'); reset(); setPreviewUrl(null); }}
          >
            Single Sign Analysis
          </button>
          <button 
            className={`btn ${activeTab === 'video' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('video'); reset(); setPreviewUrl(null); }}
          >
            Dashcam Batch Run
          </button>
        </div>

        {activeTab === 'image' && !result && !uploading && (
          <ImageUpload onUpload={onDropImage} uploading={uploading} progress={progress} />
        )}
        
        {activeTab === 'video' && !result && !uploading && (
          <VideoUpload onUpload={onDropVideo} uploading={uploading} progress={progress} />
        )}

        {uploading && (
           <div style={{ padding: '40px', textAlign: 'center' }}>
             <h3>Processing via Neural Engine...</h3>
             <div className="progress-bar-track" style={{ width: '60%', margin: '20px auto' }}>
               <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
             </div>
             <p>{progress}% complete</p>
           </div>
        )}

        {error && (
          <div className="empty-state" style={{ padding: '20px', color: 'var(--status-critical)' }}>
            Error: {error}
            <br/>
            <button className="btn btn-secondary mt-3" onClick={reset}>Try Again</button>
          </div>
        )}
      </div>

      {result && activeTab === 'image' && (
        <div className="field-view-grid animate-in-delay-1">
          <div className="field-result-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Captured Image</h3>
            <div className="result-preview">
               {previewUrl && <img src={previewUrl} alt="Analyzed Sign" />}
            </div>
          </div>
          
          <div className="field-result-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>AI Diagnostics</h3>
            <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Retroreflectivity</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '8px 0' }}>
                {result.ra_value} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>cd/lx/m²</span>
              </div>
              <HealthBadge ra={result.ra_value} signColor={result.sign_color || 'white'} />
            </div>

            <div className="result-metrics">
               <div className="metric-item">
                 <div className="metric-label">Model Confidence</div>
                 <div className="metric-value">{(result.confidence * 100).toFixed(1)}%</div>
               </div>
               <div className="metric-item">
                 <div className="metric-label">Detected Type</div>
                 <div className="metric-value">{result.sign_type || 'Unknown'}</div>
               </div>
               <div className="metric-item">
                 <div className="metric-label">Degradation Rate</div>
                 <div className="metric-value">-{result.degradation_rate}%/m</div>
               </div>
               <div className="metric-item">
                 <div className="metric-label">Est. Failure Date</div>
                 <div className="metric-value" style={{ fontSize: '0.9rem' }}>{result.predicted_failure}</div>
               </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>Sync to Cloud</button>
              <button className="btn btn-secondary" onClick={() => { reset(); setPreviewUrl(null); }}>Discard</button>
            </div>
          </div>
        </div>
      )}

      {result && activeTab === 'video' && (
        <div className="glass-card animate-in-delay-1">
           <h2>Batch Processing Complete</h2>
           <p>Successfully processed {result.processedFrames} frames. Detected {result.signsDetected} signs.</p>
           <button className="btn btn-primary" style={{ marginTop: '20px' }}>View Extracted Asset Report</button>
        </div>
      )}
    </div>
  );
}
