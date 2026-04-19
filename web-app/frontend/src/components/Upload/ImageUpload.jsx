import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiImage } from 'react-icons/fi';

export default function ImageUpload({ onUpload, uploading, progress }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => {
      if (files.length > 0 && !uploading) {
        onUpload(files[0]);
      }
    },
    accept: { 'image/*': [] },
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
      <FiUploadCloud className="upload-icon" />
      <div className="upload-text">
        {isDragActive ? "Drop picture here..." : "Drag & drop a sign image"}
      </div>
      <div className="upload-hint">Supports JPEG, PNG • Analyzed in seconds via ML</div>
      
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-info">
            <span>{progress < 60 ? 'Analyzing with AI Model...' : 'Processing Results...'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
