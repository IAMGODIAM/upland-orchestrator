import { useEffect, useState } from 'react';
import { Activity, KeyRound, LogOut, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import { login, logout, request, token } from './api.js';

const Check = ({ label, ready }) => <li className={ready ? 'ready' : 'blocked'}><span>{ready ? '●' : '○'}</span>{label}<strong>{ready ? 'READY' : 'BLOCKED'}</strong></li>;

export default function App() {
  const [health, setHealth] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadHealth = async () => { try { setHealth(await request('/api/health')); } catch (e) { setError(e.message); } };
  const loadReadiness = async () => { try { setReadiness(await request('/api/readiness')); } catch (e) { if (token()) setError(e.message); } };
  useEffect(() => { loadHealth(); if (token()) loadReadiness(); }, []);

  async function submitLogin(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(username, password); await loadReadiness(); setPassword(''); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function startConnection() {
    setBusy(true); setError('');
    try { const result = await request('/api/connections/start', { method: 'POST', body: '{}' }); window.prompt('Open Upland and enter this one-time connection code:', result.connection_code); await loadReadiness(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function refreshPortfolio() {
    setBusy(true); setError('');
    try { setPortfolio(await request('/api/portfolio/snapshot')); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  function signOut() { logout(); setReadiness(null); setPortfolio(null); }

  const authenticated = Boolean(token());
  return <main>
    <nav><div className="brand"><span>UPLAND</span> ORCHESTRATOR <small>PRIVATE · READ ONLY</small></div><div className="nav-actions"><button className="icon" onClick={loadHealth} aria-label="Refresh runtime health"><RefreshCw size={16}/></button>{authenticated && <button className="outline" onClick={signOut}><LogOut size={15}/>Sign out</button>}</div></nav>
    <section className="hero"><p className="eyebrow">SOVEREIGN OPERATIONS SURFACE</p><h1>Portfolio intelligence without <em>execution risk.</em></h1><p className="lede">A private, source-preserving Upland console. The gateway is allowlisted to sanctioned read-only account data. No purchases, listings, transfers, or account mutation exist in this runtime.</p></section>
    {error && <div role="alert" className="alert">{error}</div>}
    {!authenticated ? <section className="login card"><KeyRound size={22}/><div><p className="eyebrow">OPERATOR ACCESS</p><h2>Authenticate locally</h2><p>Credentials are verified by the self-hosted FastAPI service. Nothing routes through an external application builder.</p></div><form onSubmit={submitLogin}><label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required/></label><button disabled={busy}>{busy ? 'Verifying…' : 'Enter console'}</button></form></section> : <>
      <section className="grid"><article className="card"><Activity size={21}/><p className="eyebrow">RUNTIME</p><h2>{health?.status === 'ok' ? 'Healthy' : 'Checking'}</h2><p>{health?.runtime || 'Awaiting service response'}</p></article><article className="card"><ShieldCheck size={21}/><p className="eyebrow">RELEASE GATE</p><h2>{readiness?.production_ready ? 'Ready' : 'Blocked'}</h2><p>Private, read-only release requires every security and connection control below.</p></article><article className="card"><WalletCards size={21}/><p className="eyebrow">PORTFOLIO</p><h2>{portfolio ? `${portfolio.source_totals.properties} properties` : 'Not refreshed'}</h2><p>{portfolio ? `${portfolio.source_totals.nfts} NFTs · ${Number(portfolio.balances.upx).toLocaleString()} UPX` : 'Refresh only after a connected account is confirmed.'}</p></article></section>
      <section className="split"><article className="card controls"><p className="eyebrow">SECURITY & CONNECTION</p><h2>Production readiness</h2><ul>{Object.entries(readiness?.checks || {}).map(([name, ready]) => <Check key={name} label={name.replaceAll('_', ' ')} ready={ready}/>)}</ul><button onClick={startConnection} disabled={busy}>Start Upland connection</button><p className="hint">The code is one-time. The resulting access token is encrypted before persistence and never sent to this browser.</p></article><article className="card controls"><p className="eyebrow">SOURCE SNAPSHOT</p><h2>Portfolio refresh</h2><p>Fetches only profile, balances, properties, and NFTs through the read-only allowlist.</p><button onClick={refreshPortfolio} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh portfolio'}</button>{portfolio && <pre>{JSON.stringify(portfolio, null, 2)}</pre>}</article></section>
    </>}
    <footer>Upland Orchestrator · source-backed, private, read-only · no financial recommendation or transaction execution.</footer>
  </main>;
}
