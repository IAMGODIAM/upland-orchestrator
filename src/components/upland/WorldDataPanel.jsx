import { useState } from 'react';
import { worldDataTools } from '@/lib/worldDataTools';
import useWorldData from '@/hooks/useWorldData';
import WorldDataMenu from './WorldDataMenu'; import WorldDataSearch from './WorldDataSearch'; import DataResults from './DataResults';
export default function WorldDataPanel() {
  const [tool, setTool] = useState(worldDataTools[0]), [cityName, setCityName] = useState('');
  const data = useWorldData();
  const choose = (next) => { setTool(next); data.reset(); };
  return <div className="mx-auto max-w-[1500px] px-0 py-0 sm:px-5 sm:py-8"><header className="border-b border-border px-5 pb-6 sm:px-3"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">World data</p><h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Ask for information, not an API response.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Choose what you want to know. The secure connection, request format, and technical details stay behind the scenes.</p></header><div className="mt-0 grid border-y border-border lg:mt-6 lg:grid-cols-[288px_1fr]"><WorldDataMenu tools={worldDataTools} selected={tool} onSelect={choose}/><main className="min-w-0"><WorldDataSearch tool={tool} cityName={cityName} onCityChange={setCityName} onSearch={()=>data.search(tool,cityName)} loading={data.loading}/><DataResults tool={tool} rows={data.rows} city={data.city} searched={data.searched} error={data.error}/></main></div></div>;
}