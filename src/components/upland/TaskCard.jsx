import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
const priorities = { high: 'text-destructive', medium: 'text-primary', low: 'text-muted-foreground' };
export default function TaskCard({ task, onUpdate, onDelete }) {
  return <article className="border border-border bg-card p-4">
    <div className="flex items-start justify-between gap-3"><span className={`font-mono text-[9px] uppercase tracking-[0.18em] ${priorities[task.priority]}`}>{task.priority} · {task.area}</span><Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Delete ${task.title}`} onClick={() => window.confirm(`Delete “${task.title}”?`) && onDelete(task.id)}><Trash2 className="h-3.5 w-3.5"/></Button></div>
    <h4 className="mt-3 font-heading text-sm font-semibold leading-5">{task.title}</h4>
    {task.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{task.description}</p>}
    <label className="mt-4 block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Move to<select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onUpdate(task.id, { status: event.target.value })} className="mt-2 min-h-9 w-full border border-border bg-background px-2 text-xs text-foreground"><option value="backlog">Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></label>
  </article>;
}