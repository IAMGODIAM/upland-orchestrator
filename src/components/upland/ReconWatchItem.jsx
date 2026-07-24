import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReconScore from '@/components/upland/ReconScore';

const statuses = [['watching','Watching'],['researching','Researching'],['ready','Ready to act'],['passed','Passed'],['acquired','Acquired']];
export default function ReconWatchItem({ item, onUpdate, onRemove }) {
  const [status,setStatus]=useState(item.status), [notes,setNotes]=useState(item.notes || '');
  useEffect(()=>{setStatus(item.status);setNotes(item.notes || '');},[item.status,item.notes]);
  return <article className="border border-border bg-card p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{item.address}</p><p className="mt-1 text-xs text-muted-foreground">{item.city} · {item.neighborhood || 'Unassigned'}</p></div><ReconScore value={item.balanced_score}/></div><div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]"><select aria-label="Watchlist status" value={status} onChange={(event)=>setStatus(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><Textarea aria-label="Opportunity notes" value={notes} onChange={(event)=>setNotes(event.target.value)} placeholder="Research notes" className="min-h-10"/></div><div className="mt-3 flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={()=>onRemove(item.id)}><Trash2/>Remove</Button><Button size="sm" onClick={()=>onUpdate(item.id,{status,notes})}><Save/>Save tracking</Button></div></article>;
}