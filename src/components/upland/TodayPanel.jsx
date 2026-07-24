import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useUplandPortfolio from '@/hooks/useUplandPortfolio';
import PortfolioMetric from './PortfolioMetric';
import DailyActionCard from './DailyActionCard';

const format = (value) => Math.round(value || 0).toLocaleString('en-US');
export default function TodayPanel({ onNavigate }) {
  const { snapshot, loading, error, refresh } = useUplandPortfolio();
  if (loading) return <div className="flex min-h-96 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary"/></div>;
  if (error) return <section className="mx-auto max-w-2xl px-5 py-16 text-center"><Sparkles className="mx-auto h-9 w-9 text-primary"/><h2 className="mt-5 font-display text-4xl">Your command center is almost ready.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p><div className="mt-6 flex justify-center gap-3"><Button onClick={() => onNavigate('My Upland')}>Finish connection</Button><Button variant="outline" onClick={refresh}>Check again</Button></div></section>;
  const summary = snapshot.summary;
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Personal economy copilot</p><h2 className="mt-4 font-display text-5xl">What matters <span className="italic text-primary">today.</span></h2><p className="mt-3 text-sm text-muted-foreground">A live, connected view of your Upland position—prioritized into three understandable actions.</p></div><Button variant="outline" onClick={refresh}><RefreshCw/> Refresh snapshot</Button></header>
    <section className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"><PortfolioMetric label="Properties" value={summary.properties} detail="Connected holdings"/><PortfolioMetric label="NFT assets" value={summary.nfts} detail="Visible inventory"/><PortfolioMetric label="UPX" value={format(summary.upx)} detail="Deployable balance"/><PortfolioMetric label="Sparklet" value={format(summary.sparklet)} detail="Construction capacity"/><PortfolioMetric label="Travels" value={summary.travels} detail="Recorded movements"/></section>
    <section className="mt-12"><div className="border-b border-border pb-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Your action queue</p><h2 className="mt-2 font-display text-3xl">Three moves, in order.</h2></div><div className="mt-6 grid gap-4 lg:grid-cols-3">{snapshot.actions.map((action, index) => <DailyActionCard key={action.title} action={action} index={index} onNavigate={onNavigate}/>)}</div></section>
    <p className="mt-6 text-right text-xs text-muted-foreground">Snapshot generated {new Date(snapshot.generated_at).toLocaleString()}</p>
  </div>;
}