import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function RequestEditor({endpoint,onRun,loading}) {
 const [path,setPath]=useState(endpoint.path),[query,setQuery]=useState('{}'),[body,setBody]=useState('{}'),[token,setToken]=useState('');
 const submit=()=>onRun({endpoint:{...endpoint,path},query:JSON.parse(query||'{}'),body:endpoint.method==='GET'?undefined:JSON.parse(body||'{}'),userAccessToken:token});
 return <div className="space-y-4 p-5"><div><p className="text-sm text-muted-foreground">{endpoint.category}</p><h2 className="font-heading text-xl font-semibold">{endpoint.name}</h2></div><label className="block text-sm font-medium" htmlFor="path">Endpoint path</label><Input id="path" value={path} onChange={e=>setPath(e.target.value)} className="font-mono"/>{endpoint.authMode==='bearer'&&<><label className="block text-sm font-medium" htmlFor="token">Upland user access token</label><Input id="token" type="password" value={token} onChange={e=>setToken(e.target.value)}/></>}<label className="block text-sm font-medium" htmlFor="query">Query parameters (JSON)</label><Textarea id="query" value={query} onChange={e=>setQuery(e.target.value)} className="min-h-24 font-mono"/>{endpoint.method!=='GET'&&<><label className="block text-sm font-medium" htmlFor="body">Request body (JSON)</label><Textarea id="body" value={body} onChange={e=>setBody(e.target.value)} className="min-h-40 font-mono"/></>}<Button onClick={submit} disabled={loading} className="min-h-11">{loading?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Play className="mr-2 h-4 w-4"/>}{loading?'Sending…':`Run ${endpoint.method}`}</Button></div>;
}