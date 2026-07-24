import { Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QuickCityButtons from './QuickCityButtons';
export default function WorldDataSearch({ tool, cityName, onCityChange, onSearch, onQuickCity, loading }) {
  const submit = (event) => { event.preventDefault(); onSearch(); };
  return <form onSubmit={submit} className="border-b border-border bg-card/40 p-5 sm:p-7"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary"/><span>Securely connected — no access token required</span></div><label className="mt-6 block"><span className="font-display text-2xl font-medium">{tool.noCity ? `Show ${tool.title.toLowerCase()}` : 'Which city are you interested in?'}</span>{!tool.noCity&&<><Input autoFocus required value={cityName} onChange={(event)=>onCityChange(event.target.value)} placeholder="For example: San Francisco" className="mt-4 h-12 max-w-2xl text-base"/><QuickCityButtons onSelect={onQuickCity} disabled={loading}/></>}</label><Button type="submit" className="mt-4" disabled={loading||(!tool.noCity&&!cityName.trim())}>{loading?'Finding information…':<><Search/> Find information</>}</Button></form>;
}