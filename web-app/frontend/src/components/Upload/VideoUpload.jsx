import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FiVideo } from 'react-icons/fi';

export default function VideoUpload({ onUpload, uploading, progress }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => {
      if (files.length > 0 && !uploading) {
        onUpload(files[0]);
      }
    },
    accept: { 'video/*': [] },
    multiple: false,
    disabled: uploading
  });

  return (
    <div 
      {...getRootProps()} 
      className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
      style={{ opacity: uploading ? 0.6 : 1 }}
    >
      <input {...getInputProps()} />
      <FiVideo className="upload-icon" style={{ color: 'var(--accent-purple)' }} />
      <div className="upload-text">
        {isDragActive ? "Drop dashboard video here..." : "Upload Dashcam Footage for Batch Processing"}
      </div>
      <div className="upload-hint">MP4, AVI • AI dynamically detects & extracts signs from frames</div>
      
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--accent-purple)' }}></div>
          </div>
          <div className="progress-info">
            <span>Inferencing Frames...</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
