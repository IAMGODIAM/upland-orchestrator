import { Bookmark, Crosshair, MapPinned } from 'lucide-react';

const Card = ({ icon: Icon, label, value, detail }) => <article className="border border-border bg-card p-4"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-primary"><Icon className="h-4 w-4"/>{label}</div><p className="mt-3 font-display text-3xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></article>;
export default function ReconSummary({ results, watchlist, city }) {
  const top = results[0]?.balanced_score || 0;
  return <div className="grid gap-3 sm:grid-cols-3"><Card icon={MapPinned} label="Scan market" value={city || '—'} detail={`${results.length} properties analyzed`}/><Card icon={Crosshair} label="Top signal" value={top ? `${top}/100` : '—'} detail="Balanced opportunity score"/><Card icon={Bookmark} label="Watchlist" value={watchlist.length} detail="Tracked opportunities"/></div>;
}