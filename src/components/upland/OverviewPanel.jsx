import { Activity, ArrowRight, Braces, Gauge, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uplandEndpoints } from '@/lib/uplandEndpoints';
import MetricCard from './MetricCard';
import ArchitectureCard from './ArchitectureCard';

export default function OverviewPanel({ logs, roadmap, onNavigate }) {
  const success = logs.length ? Math.round(logs.filter((log) => log.success).length / logs.length * 100) : 100;
  const latency = logs.length ? Math.round(logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / logs.length) : 0;
  const done = roadmap.tasks.filter((task) => task.status === 'done').length;
  const active = roadmap.sprints.find((sprint) => sprint.status === 'active') || roadmap.sprints[0];
  const activeTasks = roadmap.tasks.filter((task) => task.sprint_id === active?.id);
  const progress = activeTasks.length ? Math.round(activeTasks.filter((task) => task.status === 'done').length / activeTasks.length * 100) : 0;
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <section className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Upland DevCore · Command surface</p><h2 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[0.95] sm:text-7xl">Upland, without the <span className="italic text-primary">API manual.</span></h2><p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">The gateway stays underneath. Up here, every signal and action is translated into something a person can understand.</p></div>
      <div className="flex flex-wrap gap-3 lg:justify-end"><Button onClick={() => onNavigate('Roadmap')}>Open roadmap <ArrowRight/></Button><Button variant="outline" onClick={() => onNavigate('Agent')}>Ask the operator</Button></div>
    </section>
    <section className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"><MetricCard eyebrow="Gateway health" value={`${success}%`} detail={`${logs.length} recent calls measured`} icon={Activity}/><MetricCard eyebrow="Mean response" value={latency ? `${latency}ms` : 'Ready'} detail="Across recent API traffic" icon={Gauge}/><MetricCard eyebrow="API surface" value={uplandEndpoints.length} detail="Translated capabilities" icon={Braces}/><MetricCard eyebrow="Delivery" value={`${done}/${roadmap.tasks.length}`} detail="Roadmap tasks complete" icon={Route}/></section>
    <section className="mt-12"><div className="flex items-end justify-between border-b border-border pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">The operating model</p><h2 className="mt-2 font-display text-3xl font-medium">One system, three clear responsibilities.</h2></div></div><div className="grid border-b border-border md:grid-cols-3"><ArchitectureCard number="01" label="Transport + runtime" title="Hallways" description="Moves every request safely between this interface, Upland, and future Unreal experiences."/><ArchitectureCard number="02" label="Policy + authorization" title="Boardroom" description="Controls sensitive actions, production boundaries, approvals, and economic safeguards."/><ArchitectureCard number="03" label="Human presentation" title="SPIRIT" description="Turns approved data into guidance, summaries, and understandable next actions."/></div></section>
    <section className="mt-12 border border-primary/30 bg-primary/5 p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Active sprint</p><h2 className="mt-2 font-display text-3xl font-medium">{active?.name || 'Roadmap ready'}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{active?.objective || 'Create the first sprint to begin planning.'}</p></div><p className="font-display text-4xl text-primary">{progress}%</p></div><div className="mt-6 h-1 bg-secondary"><div className="h-full bg-primary transition-all" style={{width:`${progress}%`}}/></div></section>
  </div>;
}