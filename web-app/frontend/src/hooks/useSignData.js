import { useState, useEffect } from 'react';
import { fetchSigns } from '../services/api';

/**
 * Hook to fetch and manage sign data
 */
export function useSignData(filters = {}) {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSigns(filters);
        if (!cancelled) setSigns(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await fetchSigns(filters);
      setSigns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { signs, loading, error, refetch };
}

export default useSignData;
