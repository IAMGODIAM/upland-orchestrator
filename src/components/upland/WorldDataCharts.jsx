import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from './ChartCard';
const colors=['hsl(var(--primary))','hsl(var(--accent))','hsl(var(--chart-2))','hsl(var(--chart-4))','hsl(var(--chart-1))'];
const counts=(rows,key)=>Object.entries(rows.reduce((all,row)=>({...all,[row[key]||'Other']:(all[row[key]||'Other']||0)+1}),{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
export default function WorldDataCharts({ tool, rows }) {
  const data=useMemo(()=>{
    if(tool.id==='cities')return {left:counts(rows,'countryName'),right:counts(rows,'stateName').slice(0,10)};
    if(tool.id==='neighborhoods'){const ranked=[...rows].filter((row)=>Number(row.area)>0).sort((a,b)=>b.area-a.area);return {left:ranked.slice(0,10).map((row)=>({name:row.name,value:Math.round(row.area)})),right:ranked.slice(0,5).map((row)=>({name:row.name,value:Math.round(row.area)}))};}
    return null;
  },[rows,tool.id]);
  if(!data||rows.length===0)return null;
  const cityMode=tool.id==='cities';
  return <section className="mb-6 grid gap-4 xl:grid-cols-2" aria-label={`${tool.title} charts`}><ChartCard title={cityMode?'Cities by country':'Largest neighborhoods'} detail={cityMode?'Number of visible cities in each country':'Top visible neighborhoods by land area'}><ResponsiveContainer width="100%" height="100%"><BarChart data={data.left} layout="vertical" margin={{left:10,right:16}}><CartesianGrid stroke="hsl(var(--border))" horizontal={false}/><XAxis type="number" tick={{fill:'hsl(var(--muted-foreground))',fontSize:10}}/><YAxis type="category" dataKey="name" width={100} tick={{fill:'hsl(var(--muted-foreground))',fontSize:10}}/><Tooltip/><Bar dataKey="value" fill="hsl(var(--primary))" radius={[0,3,3,0]}/></BarChart></ResponsiveContainer></ChartCard><ChartCard title={cityMode?'Most represented regions':'Area share'} detail={cityMode?'Top regions among the visible cities':'Share held by the five largest visible neighborhoods'}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.right} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>{data.right.map((entry,index)=><Cell key={entry.name} fill={colors[index%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></ChartCard></section>;
}