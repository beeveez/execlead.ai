import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useOperationalExcellence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('manageOperationalExcellence', { action: 'dashboard' });
      setData(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Operational intelligence is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);
  const run = useCallback(async (action, payload = {}) => {
    const response = await base44.functions.invoke('manageOperationalExcellence', { action, ...payload });
    await load();
    return response.data;
  }, [load]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, run, reload: load };
}