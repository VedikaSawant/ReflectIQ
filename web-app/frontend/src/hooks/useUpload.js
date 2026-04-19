import { useState, useCallback } from 'react';
import { uploadImage, uploadVideo } from '../services/api';
import { analyzeSignImage } from '../services/aiEngine';

/**
 * Hook to handle file uploads (images & videos) with progress tracking
 */
export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = useCallback(async (file, metadata = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // First upload the image
      setProgress(20);
      const uploadResult = await uploadImage(file, metadata);
      setProgress(60);

      // Then run AI analysis
      const analysis = await analyzeSignImage(file);
      setProgress(100);

      const combined = { ...uploadResult, ...analysis };
      setResult(combined);
      return combined;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const handleVideoUpload = useCallback(async (file) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const videoResult = await uploadVideo(file, (pct) => setProgress(pct));
      setResult(videoResult);
      return videoResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    result,
    error,
    handleImageUpload,
    handleVideoUpload,
    reset,
  };
}

export default useUpload;
