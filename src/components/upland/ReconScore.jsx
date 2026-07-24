export default function ReconScore({ value }) {
  const label = value >= 75 ? 'Strong' : value >= 55 ? 'Review' : 'Weak';
  return <div className="min-w-24"><div className="flex items-baseline justify-between"><strong className="font-mono text-lg text-primary">{value}</strong><span className="text-[10px] text-muted-foreground">{label}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${value}%` }}/></div></div>;
}