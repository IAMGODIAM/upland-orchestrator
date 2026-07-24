import { useState } from 'react';
import { Check, ExternalLink, Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function SaveBrainstormButton({ messages }) {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const save = async () => {
    setSaving(true); setError(''); setResult(null);
    const firstPrompt = messages.find((message) => message.role === 'user')?.content;
    const title = String(firstPrompt || 'Upland Brainstorm').replace(/\s+/g, ' ').slice(0, 80);
    try {
      const response = await base44.functions.invoke('saveBrainstormToDrive', {
        title,
        messages: messages.map(({ role, content }) => ({ role, content: String(content || '') }))
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this brainstorm.');
    } finally { setSaving(false); }
  };
  return <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-5 py-3">
    <Button size="sm" onClick={save} disabled={saving || messages.length === 0}>
      {saving ? <Loader2 className="animate-spin"/> : result ? <Check/> : <Save/>}
      {saving ? 'Saving…' : result ? 'Saved to Drive' : 'Save brainstorm'}
    </Button>
    {result && <a href={result.webViewLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">Open HTML file <ExternalLink className="h-3 w-3"/></a>}
    {result && <span className="text-xs text-muted-foreground">{result.folderPath}</span>}
    {error && <span role="alert" className="text-sm text-destructive">{error}</span>}
  </div>;
}