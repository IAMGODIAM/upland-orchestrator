import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { uplandEndpoints } from '@/lib/uplandEndpoints';

export default function useUplandDashboard() {
  const [selected,setSelected]=useState(uplandEndpoints[0]); const [logs,setLogs]=useState([]); const [control,setControl]=useState(null);
  const [response,setResponse]=useState(null); const [loading,setLoading]=useState(false);
  const refreshLogs=async()=>setLogs(await base44.entities.ApiLog.list('-created_date',50));
  useEffect(()=>{(async()=>{ await refreshLogs(); const rows=await base44.entities.AgentControl.list('-created_date',1); setControl(rows[0] || await base44.entities.AgentControl.create({god_mode:false})); })();},[]);
  const execute=async({endpoint,query,body,userAccessToken})=>{ setLoading(true); setResponse(null); try { const mutation=endpoint.method!=='GET'; if(mutation&&!window.confirm(`Run ${endpoint.method} ${endpoint.path}?`)) return; const result=await base44.functions.invoke('uplandApiCall',{endpoint:endpoint.path,method:endpoint.method,category:endpoint.category,authMode:endpoint.authMode,query,body,userAccessToken,source:'dashboard',confirmed:true}); setResponse(result.data); await refreshLogs(); } catch(error){setResponse(error.response?.data || {error:error.message});} finally {setLoading(false);} };
  const toggleGodMode=async(value)=>{ const updated=await base44.entities.AgentControl.update(control.id,{god_mode:value}); setControl(updated); };
  return {selected,setSelected,logs,response,loading,execute,control,toggleGodMode,refreshLogs};
}