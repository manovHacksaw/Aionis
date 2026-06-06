'use client';

import dynamic from 'next/dynamic';
const DynamicWidget = dynamic(
  () => import('@dynamic-labs/sdk-react-core').then((m) => m.DynamicWidget),
  { ssr: false }
);
import Link                from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const WINDOWS = ['5m', '30m', '1h', '6h', '12h', '24h'] as const;
type Window = typeof WINDOWS[number];

interface Trader {
  rank: number; address: string; trades: number; volume: number;
  buys: number; sells: number; lastSide: string|null; lastPrice: number|null;
  lastVolume: number|null; lastSeen: string|null;
}

interface SearchResult {
  address: string; found: boolean;
  stats: { trades: number; volume: number; buys: number; sells: number };
  recentSwaps: { side: string; usdValue: number; wsomiPrice: number; txHash: string|null; timestamp: string }[];
}

function BuySellBar({ buys, sells }: { buys: number; sells: number }) {
  const total = buys + sells;
  if (!total) return <span style={{ color:'var(--text-muted)',fontSize:'0.8rem' }}>—</span>;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
      <div style={{ width:44, height:4, borderRadius:4, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
        <div style={{ width:`${(buys/total)*100}%`, height:'100%', background:'var(--success)' }} />
      </div>
      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{buys}B/{sells}S</span>
    </div>
  );
}

function ago(ts: string|null) {
  if (!ts) return '—';
  const d = Date.now() - new Date(ts).getTime();
  if (d < 60e3) return `${Math.floor(d/1e3)}s ago`;
  if (d < 3600e3) return `${Math.floor(d/60e3)}m ago`;
  if (d < 86400e3) return `${Math.floor(d/3600e3)}h ago`;
  return `${Math.floor(d/86400e3)}d ago`;
}

export default function TradersPage() {
  const [win,   setWin]   = useState<Window>('1h');
  const [list,  setList]  = useState<Trader[]>([]);
  const [busy,  setBusy]  = useState(true);
  const [watch, setWatch] = useState<Set<string>>(new Set());
  const [q,     setQ]     = useState('');
  const [sr,    setSr]    = useState<SearchResult|null>(null);
  const [sq,    setSq]    = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('aionis:following');
    if (s) setWatch(new Set(JSON.parse(s)));
  }, []);

  const persist = (s: Set<string>) => {
    localStorage.setItem('aionis:following', JSON.stringify([...s]));
    setWatch(new Set(s));
  };

  const toggle = async (addr: string) => {
    const n = new Set(watch);
    const action = n.has(addr) ? 'unfollow' : 'follow';
    action === 'unfollow' ? n.delete(addr) : n.add(addr);
    persist(n);
    await fetch('/api/vault', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action, follower:'anonymous', leader: addr }),
    }).catch(()=>{});
  };

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/traders/leaderboard?window=${win}`);
      setList((await r.json()).traders ?? []);
    } catch {}
    setBusy(false);
  }, [win]);

  useEffect(() => { load(); }, [load]);

  const search = async () => {
    const a = q.trim().toLowerCase();
    if (!/^0x[0-9a-f]{40}$/i.test(a)) return;
    setSq(true); setSr(null);
    try { setSr(await (await fetch(`/api/traders/search?address=${a}&window=${win}`)).json()); }
    catch {}
    setSq(false);
  };

  return (
    <div className="container">
      <header className="glass-panel">
        <div className="logo"><span>⚡</span> Aionis</div>
        <nav style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <Link href="/"          style={{ color:'var(--text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>Home</Link>
          <Link href="/traders"   style={{ color:'var(--text-primary)',   textDecoration:'none', fontSize:'0.9rem', fontWeight:700 }}>Traders</Link>
          <Link href="/portfolio" style={{ color:'var(--text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>Portfolio</Link>
          <DynamicWidget />
        </nav>
      </header>

      <main style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800 }}>Leaderboard</h1>
            <p style={{ color:'var(--text-secondary)', marginTop:'0.3rem', fontSize:'0.9rem' }}>
              Top traders on QuickSwap WSOMI/USDC.e · Somnia Mainnet · No wallet needed to monitor.
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <input className="form-input"
              style={{ width:280, fontSize:'0.85rem', padding:'0.55rem 0.85rem' }}
              placeholder="Search any 0x… address"
              value={q} onChange={e=>setQ(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&search()} />
            <button className="btn btn-secondary"
              style={{ padding:'0.55rem 1rem', fontSize:'0.85rem' }}
              onClick={search} disabled={sq}>
              {sq ? '…' : 'Look up'}
            </button>
          </div>
        </div>

        {sr && (
          <div className="glass-panel panel-content" style={{ borderColor:'rgba(99,102,241,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <div>
                <p style={{ fontFamily:'monospace', fontSize:'0.9rem' }}>{sr.address}</p>
                <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>
                  {sr.found
                    ? `${sr.stats.trades} trades · $${sr.stats.volume.toFixed(2)} vol · ${sr.stats.buys}B/${sr.stats.sells}S in ${win}`
                    : `No swaps in ${win} window`}
                </p>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button className={watch.has(sr.address)?'btn btn-secondary':'btn btn-primary'}
                  style={{ fontSize:'0.82rem', padding:'0.45rem 1rem' }} onClick={()=>toggle(sr.address)}>
                  {watch.has(sr.address) ? 'Monitoring ✓' : '+ Monitor'}
                </button>
                <button className="btn btn-secondary" style={{ fontSize:'0.82rem', padding:'0.45rem 0.7rem' }}
                  onClick={()=>setSr(null)}>✕</button>
              </div>
            </div>
            {sr.recentSwaps.length > 0 && (
              <div style={{ maxHeight:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                {sr.recentSwaps.slice(0,10).map((s,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.75rem', fontSize:'0.82rem', padding:'0.35rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color:s.side==='BUY'?'var(--success)':'var(--error)', fontWeight:700, width:36 }}>{s.side}</span>
                    <span>${s.usdValue.toFixed(2)}</span>
                    <span style={{ color:'var(--text-muted)' }}>@ ${s.wsomiPrice.toFixed(4)}</span>
                    {s.txHash && <a href={`https://explorer.somnia.network/tx/${s.txHash}`} target="_blank" rel="noreferrer" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.72rem' }}>↗</a>}
                    <span style={{ marginLeft:'auto', color:'var(--text-muted)' }}>{ago(s.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
          {WINDOWS.map(w => (
            <button key={w} onClick={()=>setWin(w)} style={{
              padding:'0.35rem 0.9rem', borderRadius:8, fontSize:'0.82rem', fontWeight:600,
              cursor:'pointer', border:'none', transition:'all 0.15s',
              background: win===w ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color:      win===w ? 'white'          : 'var(--text-secondary)',
              boxShadow:  win===w ? '0 2px 10px rgba(99,102,241,0.3)' : 'none',
            }}>{w}</button>
          ))}
          {watch.size > 0 && (
            <span style={{ fontSize:'0.78rem', color:'var(--primary)', marginLeft:'0.5rem' }}>
              {watch.size} monitored
            </span>
          )}
          <button onClick={load} style={{ marginLeft:'auto', padding:'0.35rem 0.75rem', borderRadius:8, fontSize:'0.82rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--text-muted)', cursor:'pointer' }}>↻</button>
        </div>

        <div className="glass-panel panel-content">
          {busy ? (
            <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'3rem' }}>Loading {win} data…</p>
          ) : list.length === 0 ? (
            <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'3rem' }}>No activity in {win} window. Try a longer range.</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    {['#','Trader','Trades','Volume','B/S','Last',''].map(h => (
                      <th key={h} style={{ padding:'0.65rem 0.75rem', textAlign:'left', color:'var(--text-muted)', fontWeight:600, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map(t => (
                    <tr key={t.address}
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.12s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>

                      <td style={{ padding:'0.85rem 0.75rem', width:40, color:'var(--text-muted)' }}>
                        {t.rank<=3 ? ['🥇','🥈','🥉'][t.rank-1] : <span style={{ fontSize:'0.8rem', fontWeight:700 }}>{t.rank}</span>}
                      </td>

                      <td style={{ padding:'0.85rem 0.75rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <span style={{ fontFamily:'monospace', fontSize:'0.85rem' }}>
                            {t.address.slice(0,8)}…{t.address.slice(-4)}
                          </span>
                          <a href={`https://explorer.somnia.network/address/${t.address}`}
                            target="_blank" rel="noreferrer"
                            style={{ fontSize:'0.72rem', color:'var(--text-muted)', textDecoration:'none' }}>↗</a>
                        </div>
                      </td>

                      <td style={{ padding:'0.85rem 0.75rem', fontWeight:600 }}>{t.trades}</td>

                      <td style={{ padding:'0.85rem 0.75rem', fontWeight:700 }}>
                        ${t.volume>=1000 ? `${(t.volume/1000).toFixed(1)}k` : t.volume.toFixed(0)}
                      </td>

                      <td style={{ padding:'0.85rem 0.75rem' }}>
                        <BuySellBar buys={t.buys} sells={t.sells} />
                      </td>

                      <td style={{ padding:'0.85rem 0.75rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          <span style={{
                            padding:'0.12rem 0.4rem', borderRadius:5, fontSize:'0.72rem', fontWeight:700,
                            background: t.lastSide==='BUY' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color:      t.lastSide==='BUY' ? 'var(--success)' : 'var(--error)',
                          }}>{t.lastSide??'—'}</span>
                          <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{ago(t.lastSeen)}</span>
                        </div>
                      </td>

                      <td style={{ padding:'0.85rem 0.75rem' }}>
                        <button onClick={()=>toggle(t.address)} style={{
                          padding:'0.28rem 0.75rem', borderRadius:7, fontSize:'0.78rem', fontWeight:600,
                          cursor:'pointer', border:'none', transition:'all 0.12s',
                          background: watch.has(t.address) ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.06)',
                          color:      watch.has(t.address) ? 'var(--primary)'        : 'var(--text-secondary)',
                        }}>
                          {watch.has(t.address) ? '✓ Monitoring' : '+ Monitor'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center' }}>
          Live · QuickSwap WSOMI/USDC.e · Somnia Mainnet chain 5031
        </p>
      </main>

      <footer>
        <p>© 2026 Aionis · Built on Somnia</p>
      </footer>
    </div>
  );
}
