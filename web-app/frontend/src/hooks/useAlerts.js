import { useState, useEffect, useRef } from 'react';
import { fetchAlerts } from '../services/api';

/**
 * Hook to poll for alerts at a configurable interval
 */
export function useAlerts(pollInterval = 30000) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const load = async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, pollInterval);
    return () => clearInterval(intervalRef.current);
  }, [pollInterval]);

  const criticalCount = alerts.filter(a => a.severity === 'high').length;

  return { alerts, loading, error, criticalCount, refetch: load };
}

export default useAlerts;
