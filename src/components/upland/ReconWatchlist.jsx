import { Bookmark } from 'lucide-react';
import ReconWatchItem from '@/components/upland/ReconWatchItem';

export default function ReconWatchlist({ items, onUpdate, onRemove }) {
  return <section><div className="mb-4"><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">Tracked pipeline</p><h3 className="mt-2 font-display text-3xl">Opportunity watchlist</h3></div>{items.length ? <div className="grid gap-3 xl:grid-cols-2">{items.map((item)=><ReconWatchItem key={item.id} item={item} onUpdate={onUpdate} onRemove={onRemove}/>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center border border-dashed border-border p-6 text-center"><Bookmark className="h-6 w-6 text-primary"/><p className="mt-3 text-sm text-muted-foreground">Watch an opportunity from the ranked scan to track its review status here.</p></div>}</section>;
}