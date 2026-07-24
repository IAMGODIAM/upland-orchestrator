export default function PortfolioMetric({ label, value, detail }) {
  return <article className="bg-card p-5">
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-4 font-display text-4xl text-foreground">{value}</p>
    <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
  </article>;
}