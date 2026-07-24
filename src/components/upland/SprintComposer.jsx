import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function SprintComposer({ onCreate, onClose }) {
  const [form, setForm] = useState({ name: '', objective: '', target_date: '' }), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const save = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await onCreate(form); onClose(); } catch { setError('Sprint could not be created.'); } finally { setSaving(false); } };
  return <form onSubmit={save} className="grid gap-3 border border-primary/30 bg-card p-4 md:grid-cols-[1fr_2fr_180px_auto]"><Input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Sprint name"/><Input required value={form.objective} onChange={(e)=>setForm({...form,objective:e.target.value})} placeholder="Outcome this sprint must deliver"/><Input type="date" value={form.target_date} onChange={(e)=>setForm({...form,target_date:e.target.value})}/><div className="flex gap-2"><Button size="sm" type="submit" disabled={saving}>{saving?'Saving…':'Create'}</Button><Button size="sm" type="button" variant="ghost" onClick={onClose}>Cancel</Button></div>{error&&<p className="text-sm text-destructive md:col-span-4">{error}</p>}</form>;
}