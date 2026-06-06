'use client';
import ConnectButton from '@/components/ConnectButton';

import { useAccount }          from 'wagmi';
import Link                    from 'next/link';
import { useState, useEffect } from 'react';

interface OpenPosition {
  id:            string;
  leader:        string;
  token:         string;
  usdcSpent:     number;
  tokenAmount:   number;
  entryPrice:    number;
  currentPrice:  number;
  unrealisedPnl: number;
  unrealisedPct: number;
  timestamp:     string;
}

interface ClosedTrade {
  id:         string;
  leader:     string;
  token:      string;
  usdcSpent:  number;
  entryPrice: number;
  exitPrice:  number;
  pnl:        number;
  timestamp:  string;
}

interface Portfolio {
  vault:              { virtualUsdc: number; startingCapital: number } | null;
  openPositions:      OpenPosition[];
  closedTrades:       ClosedTrade[];
  following:          string[];
  wsomiPrice:         number;
  totalUnrealisedPnl: number;
  totalRealisedPnl:   number;
}

function PnlBadge({ value, pct }: { value: number; pct?: number }) {
  const color = value >= 0 ? 'var(--success)' : 'var(--error)';
  return (
    <span style={{ color, fontWeight: 700 }}>
      {value >= 0 ? '+' : ''}${value.toFixed(2)}
      {pct !== undefined && (
        <span style={{ fontSize: '0.8em', marginLeft: 4, opacity: 0.8 }}>
          ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
        </span>
      )}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</p>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
      {sub && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</p>}
    </div>
  );
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading]     = useState(false);

  const fetchPortfolio = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio?address=${address}`);
      const data = await res.json();
      setPortfolio(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30_000); // refresh every 30s for live P&L
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const totalValue = portfolio
    ? (portfolio.vault?.virtualUsdc ?? 0) + portfolio.totalUnrealisedPnl
    : 0;

  const totalReturn = portfolio?.vault
    ? ((totalValue - portfolio.vault.startingCapital) / portfolio.vault.startingCapital) * 100
    : 0;

  return (
    <div className="container">
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {!isConnected ? (
          <div className="glass-panel panel-content" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Connect your wallet to view your virtual portfolio.
            </p>
            <ConnectButton />
          </div>
        ) : loading && !portfolio ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            Loading portfolio…
          </div>
        ) : !portfolio?.vault ? (
          <div className="glass-panel panel-content" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>No vault found</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Go to <Link href="/traders" style={{ color: 'var(--primary)' }}>Star Traders</Link> and follow someone to create your paper vault.
            </p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Stat
                label="Virtual Balance"
                value={`$${(portfolio.vault.virtualUsdc / 1e6).toFixed(2)}`}
                sub="available USDC.e"
              />
              <Stat
                label="Unrealised P&L"
                value={<PnlBadge value={portfolio.totalUnrealisedPnl} />}
                sub={`WSOMI @ $${portfolio.wsomiPrice.toFixed(4)}`}
              />
              <Stat
                label="Realised P&L"
                value={<PnlBadge value={portfolio.totalRealisedPnl} />}
                sub={`${portfolio.closedTrades.length} closed trades`}
              />
              <Stat
                label="Total Return"
                value={
                  <span style={{ color: totalReturn >= 0 ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>
                    {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                  </span>
                }
                sub={`from $${(portfolio.vault.startingCapital / 1e6).toFixed(0)} starting`}
              />
            </div>

            {/* Open positions */}
            <div className="glass-panel panel-content">
              <h2 className="card-title"><span>📈</span> Open Positions</h2>
              {portfolio.openPositions.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No open positions. The watcher will open positions when your followed traders swap.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {['Leader', 'Token', 'Invested', 'Entry', 'Current', 'Unrealised P&L'].map((h) => (
                          <th key={h} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.openPositions.map((pos) => (
                        <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {pos.leader.slice(0, 8)}…
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{pos.token}</td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>${pos.usdcSpent.toFixed(2)}</td>
                          <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace' }}>${pos.entryPrice.toFixed(4)}</td>
                          <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace' }}>${pos.currentPrice.toFixed(4)}</td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <PnlBadge value={pos.unrealisedPnl} pct={pos.unrealisedPct} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Trade history */}
            <div className="glass-panel panel-content">
              <h2 className="card-title"><span>📋</span> Trade History</h2>
              {portfolio.closedTrades.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No closed trades yet.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {['Leader', 'Token', 'Invested', 'Entry', 'Exit', 'P&L', 'Date'].map((h) => (
                          <th key={h} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.closedTrades.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{t.leader.slice(0, 8)}…</td>
                          <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{t.token}</td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>${t.usdcSpent.toFixed(2)}</td>
                          <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace' }}>${t.entryPrice.toFixed(4)}</td>
                          <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace' }}>${t.exitPrice.toFixed(4)}</td>
                          <td style={{ padding: '0.85rem 0.5rem' }}><PnlBadge value={t.pnl} /></td>
                          <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {new Date(t.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Following list */}
            {portfolio.following.length > 0 && (
              <div className="glass-panel panel-content">
                <h2 className="card-title" style={{ marginBottom: '1rem' }}><span>👥</span> Following</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {portfolio.following.map((addr) => (
                    <Link key={addr} href={`/traders/${addr}`}
                      style={{
                        fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.4rem 0.85rem',
                        borderRadius: 8, background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary)',
                        textDecoration: 'none',
                      }}>
                      {addr.slice(0, 10)}…{addr.slice(-4)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        <p>© 2026 Somnia Space</p>
        <p style={{ color: 'var(--text-muted)' }}>Prices refresh every 30s from Somnia Mainnet</p>
      </footer>
    </div>
  );
}
