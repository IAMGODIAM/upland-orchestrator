import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReconSearchBar({ value, onChange, onScan, loading }) {
  const submit = (event) => { event.preventDefault(); if (value.trim()) onScan(value); };
  return <form onSubmit={submit} className="flex flex-col gap-3 border-y border-border bg-card p-5 sm:flex-row">
    <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input aria-label="Upland city" value={value} onChange={(event)=>onChange(event.target.value)} placeholder="Enter an Upland city" className="h-10 pl-10"/></div>
    <Button type="submit" disabled={loading || !value.trim()} className="h-10">{loading ? 'Scanning…' : 'Run recon scan'}</Button>
  </form>;
}