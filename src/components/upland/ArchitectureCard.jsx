import { ArrowUpRight } from 'lucide-react';
export default function ArchitectureCard({ number, title, label, description }) {
  return <article className="group border-l border-border px-5 py-4 first:border-l-0">
    <div className="flex items-start justify-between gap-4">
      <span className="font-mono text-xs text-primary">{number}</span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"/>
    </div>
    <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <h3 className="mt-2 font-display text-2xl font-medium">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
  </article>;
}