import { Radar } from 'lucide-react';
import ReconOpportunityRow from '@/components/upland/ReconOpportunityRow';

export default function ReconResults({ results, watchlist, searched, error, onSave }) {
  if (error) return <div className="border border-destructive/50 bg-destructive/10 p-5 text-sm text-destructive">{error}</div>;
  if (!searched) return <div className="flex min-h-56 flex-col items-center justify-center border border-dashed border-border p-8 text-center"><Radar className="h-8 w-8 text-primary"/><p className="mt-4 font-display text-2xl">Choose a city to begin recon.</p><p className="mt-2 max-w-lg text-sm text-muted-foreground">Properties are ranked by relative value, available yield signals, and market liquidity. Scores are decision support, not guaranteed returns.</p></div>;
  if (!results.length) return <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No property data is currently available for this city.</div>;
  const saved = new Set(watchlist.map((item)=>item.source_property_id));
  return <div className="overflow-x-auto border border-border"><table className="w-full min-w-[980px] text-left"><thead className="bg-secondary font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="px-4 py-3">Property</th><th className="px-4 py-3">Price signal</th><th className="px-4 py-3">Relative value</th><th className="px-4 py-3">Score mix</th><th className="px-4 py-3">Balanced score</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody>{results.map((item)=><ReconOpportunityRow key={item.source_property_id} item={item} saved={saved.has(item.source_property_id)} onSave={onSave}/>)}</tbody></table></div>;
}