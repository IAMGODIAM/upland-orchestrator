import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildReconRows } from '@/lib/reconScoring';

const firstArray = (value) => Array.isArray(value) ? value : Object.values(value || {}).find(Array.isArray) || [];
const callUpland = async (endpoint, query = {}) => {
  const response = await base44.functions.invoke('uplandApiCall', { endpoint, method: 'GET', category: 'Inventory Recon', authMode: 'basic', query, source: 'dashboard' });
  return response.data.data || {};
};

export default function useInventoryRecon() {
  const [results, setResults] = useState([]), [watchlist, setWatchlist] = useState([]), [city, setCity] = useState('');
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [searched, setSearched] = useState(false);
  const loadWatchlist = useCallback(async () => setWatchlist(await base44.entities.InventoryOpportunity.list('-balanced_score', 100)), []);
  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);
  const scan = async (cityName) => {
    setLoading(true); setError(''); setSearched(false);
    try {
      const citiesData = await callUpland('/cities'), cities = citiesData.cities || firstArray(citiesData);
      const term = cityName.trim().toLowerCase();
      const match = cities.find((item) => item.name?.toLowerCase() === term) || cities.find((item) => item.name?.toLowerCase().includes(term));
      if (!match) throw new Error(`We could not find “${cityName}” in Upland.`);
      const propertiesData = await callUpland('/v2/properties', { cityId: match.id, pageSize: 100 });
      setCity(match.name); setResults(buildReconRows(firstArray(propertiesData), match.name)); setSearched(true);
    } catch (reason) { setError(reason.response?.data?.error || reason.message || 'The recon scan could not be completed.'); }
    finally { setLoading(false); }
  };
  const save = async (item) => {
    setError('');
    try {
      const data = { source_property_id: item.source_property_id, address: item.address, city: item.city, neighborhood: item.neighborhood, ask_price: item.ask_price, reference_price: item.reference_price, discount_percent: item.discount_percent, yield_score: item.yield_score, liquidity_score: item.liquidity_score, balanced_score: item.balanced_score, source_status: item.source_status, status: 'watching', notes: '', last_seen_at: new Date().toISOString() };
      const existing = watchlist.find((row) => row.source_property_id === item.source_property_id);
      if (existing) await base44.entities.InventoryOpportunity.update(existing.id, data); else await base44.entities.InventoryOpportunity.create(data);
      await loadWatchlist();
    } catch (reason) { setError(reason.message || 'The opportunity could not be saved.'); }
  };
  const update = async (id, changes) => { setError(''); try { const saved = await base44.entities.InventoryOpportunity.update(id, changes); setWatchlist((items) => items.map((item) => item.id === id ? saved : item)); } catch (reason) { setError(reason.message || 'Tracking could not be updated.'); } };
  const remove = async (id) => { setError(''); try { await base44.entities.InventoryOpportunity.delete(id); setWatchlist((items) => items.filter((item) => item.id !== id)); } catch (reason) { setError(reason.message || 'The opportunity could not be removed.'); } };
  return { results, watchlist, city, loading, error, searched, scan, save, update, remove };
}