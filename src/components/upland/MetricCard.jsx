export default function MetricCard({ eyebrow, value, detail, icon: Icon }) {
  return <article className="border-t border-primary/40 bg-card/70 px-5 py-5">
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <Icon className="h-4 w-4 text-primary"/>
    </div>
    <p className="mt-5 font-display text-4xl font-medium leading-none text-foreground">{value}</p>
    <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
  </article>;
}