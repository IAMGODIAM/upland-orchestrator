import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const labels = { high: 'Do first', medium: 'Consider today', low: 'Explore' };
export default function DailyActionCard({ action, index, onNavigate }) {
  return <article className="flex flex-col border border-border bg-card p-5">
    <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{String(index + 1).padStart(2, '0')}</span><span className="text-xs text-muted-foreground">{labels[action.priority]}</span></div>
    <h3 className="mt-6 text-lg font-semibold">{action.title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.reason}</p>
    <p className="mt-5 border-l border-primary pl-3 text-xs leading-5 text-foreground">{action.impact}</p>
    <Button variant="ghost" className="mt-6 justify-between px-0" onClick={() => onNavigate(action.destination)}>Open workspace <ArrowRight/></Button>
  </article>;
}