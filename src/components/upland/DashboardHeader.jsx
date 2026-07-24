import { ShieldCheck, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function DashboardHeader({control,onToggle}) {
  return <header className="flex flex-col gap-4 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3"><div className="rounded-lg bg-primary p-2 text-primary-foreground"><Zap className="h-5 w-5"/></div><div><h1 className="font-heading text-lg font-semibold">Upland DevCore</h1><p className="text-sm text-muted-foreground">Primary Upland App · Production</p></div></div>
    <div className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 ${control?.god_mode?'border-destructive bg-destructive/10':'border-border'}`}><ShieldCheck className="h-4 w-4"/><label htmlFor="god-mode" className="cursor-pointer text-sm font-medium">God Mode {control?.god_mode?'On':'Off'}</label><Switch id="god-mode" checked={control?.god_mode||false} onCheckedChange={onToggle}/></div>
  </header>;
}