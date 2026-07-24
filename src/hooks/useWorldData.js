import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const firstArray = (value) => Object.values(value || {}).find(Array.isArray) || [];
const callUpland = async (endpoint, query = {}) => {
  const response = await base44.functions.invoke('uplandApiCall', { endpoint, method: 'GET', category: 'World Data', authMode: 'basic', query, source: 'dashboard' });
  return response.data.data || {};
};
export default function useWorldData() {
  const [rows, setRows] = useState([]), [city, setCity] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState(''), [searched, setSearched] = useState(false);
  const search = async (tool, cityName) => {
    setLoading(true); setError(''); setRows([]); setSearched(false);
    try {
      const citiesData = tool.noCity ? null : await callUpland('/cities');
      const cities = citiesData?.cities || firstArray(citiesData);
      const term = cityName.trim().toLowerCase();
      const match = tool.noCity ? null : cities.find((item) => item.name.toLowerCase() === term) || cities.find((item) => item.name.toLowerCase().includes(term));
      if (!tool.noCity && !match) throw new Error(`We could not find “${cityName}” in Upland.`);
      setCity(match);
      let data = citiesData, query = {};
      if (tool.id === 'neighborhoods') query = { cityId: match.id };
      if (tool.id === 'properties') query = { cityId: match.id, pageSize: 30 };
      if (tool.id === 'tracks') query = { cityName: match.name };
      if (tool.id === 'treasures') query = { cityId: match.id, currentPage: 1, pageSize: 30 };
      if (tool.id !== 'cities') data = await callUpland(tool.endpoint, query);
      let found = tool.id === 'cities' ? cities.filter((item) => item.name.toLowerCase().includes(term)) : firstArray(data);
      if (tool.id === 'collections') found = found.filter((item) => item.cityId === match.id);
      setRows(found); setSearched(true);
    } catch (reason) { setError(reason.response?.data?.error || reason.message || 'The information could not be loaded.'); }
    finally { setLoading(false); }
  };
  const reset = () => { setRows([]); setCity(null); setError(''); setSearched(false); };
  return { rows, city, loading, error, searched, search, reset };
}