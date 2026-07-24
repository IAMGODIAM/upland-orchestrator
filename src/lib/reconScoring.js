const get = (row, paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((current, key) => current?.[key], row);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
};

const number = (row, paths) => {
  const value = Number(get(row, paths));
  return Number.isFinite(value) ? value : 0;
};

const median = (values) => {
  const sorted = values.filter((value) => value > 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const clamp = (value) => Math.max(0, Math.min(100, value));

export function buildReconRows(rows, city) {
  const source = rows.map((row, index) => ({
    raw: row,
    source_property_id: String(get(row, ['id', 'propertyId', 'propId']) || `${city}-${index}`),
    address: String(get(row, ['fullAddress', 'address', 'name']) || 'Unknown address'),
    neighborhood: String(get(row, ['neighborhood.name', 'neighborhoodName', 'neighborhood']) || 'Unassigned'),
    ask_price: number(row, ['salePrice', 'listingPrice', 'marketplacePrice', 'price', 'mintPrice']),
    yield_value: number(row, ['yield', 'yieldRate', 'earningsRate', 'monthlyEarnings', 'earnings']),
    source_status: String(get(row, ['status', 'marketplaceStatus', 'state']) || 'Unknown')
  }));
  const cityMedian = median(source.map((item) => item.ask_price));
  const maxYield = Math.max(0, ...source.map((item) => item.yield_value));
  const neighborhoods = source.reduce((counts, item) => ({ ...counts, [item.neighborhood]: (counts[item.neighborhood] || 0) + 1 }), {});
  return source.map((item) => {
    const localMedian = median(source.filter((other) => other.neighborhood === item.neighborhood).map((other) => other.ask_price)) || cityMedian;
    const discount = localMedian && item.ask_price ? ((localMedian - item.ask_price) / localMedian) * 100 : 0;
    const discountScore = item.ask_price ? clamp(50 + discount * 2) : 0;
    const yieldScore = maxYield && item.yield_value ? clamp((item.yield_value / maxYield) * 100) : 0;
    const status = item.source_status.toLowerCase();
    const liquidityBase = status.includes('sale') ? 85 : status.includes('unlocked') || status.includes('mint') ? 65 : 35;
    const liquidityScore = clamp(liquidityBase + Math.min(15, (neighborhoods[item.neighborhood] || 1) * 3));
    return { ...item, city, reference_price: Math.round(localMedian), discount_percent: Number(discount.toFixed(1)), discount_score: Math.round(discountScore), yield_score: Math.round(yieldScore), liquidity_score: Math.round(liquidityScore), balanced_score: Math.round(discountScore * 0.45 + yieldScore * 0.3 + liquidityScore * 0.25) };
  }).sort((a, b) => b.balanced_score - a.balanced_score);
}