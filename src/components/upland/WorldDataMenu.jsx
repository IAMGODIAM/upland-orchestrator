export default function WorldDataMenu({ tools, selected, onSelect }) {
  return <aside className="border-r border-border bg-card/40 p-3 lg:w-72">
    <p className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">What would you like to see?</p>
    <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{tools.map((tool) => { const Icon=tool.icon; return <button key={tool.id} onClick={()=>onSelect(tool)} className={`flex min-h-16 items-center gap-3 border px-3 text-left transition-colors ${selected.id===tool.id?'border-primary bg-primary/10':'border-transparent hover:border-border hover:bg-card'}`}><Icon className="h-4 w-4 shrink-0 text-primary"/><span><span className="block text-sm font-medium">{tool.title}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{tool.description}</span></span></button>; })}</div>
  </aside>;
}