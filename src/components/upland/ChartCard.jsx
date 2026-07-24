export default function ChartCard({ title, detail, children }) {
  return <article className="min-w-0 border border-border bg-card/40 p-4"><div className="mb-4"><h4 className="text-sm font-semibold">{title}</h4><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><div className="h-64 w-full" role="img" aria-label={title}>{children}</div></article>;
}