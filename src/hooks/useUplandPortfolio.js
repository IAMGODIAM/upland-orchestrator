import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useUplandPortfolio() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await base44.functions.invoke('uplandPortfolioSnapshot', {}); setSnapshot(response.data); }
    catch (reason) { setError(reason.response?.data?.error || reason.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { snapshot, loading, error, refresh };
}