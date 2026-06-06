import { NextResponse }  from 'next/server';
import { prisma }        from '@/lib/prisma';
import { getWsomiPrice } from '@/lib/price';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address')?.toLowerCase();

  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const [vault, openTrades, closedTrades, following] = await Promise.all([
    prisma.vault.findUnique({ where: { address } }),
    prisma.paperTrade.findMany({
      where:   { follower: address, status: 'OPEN' },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.paperTrade.findMany({
      where:   { follower: address, status: 'CLOSED' },
      orderBy: { timestamp: 'desc' },
      take:    20,
    }),
    prisma.follow.findMany({
      where:  { follower: address },
      select: { leader: true },
    }),
  ]);

  let wsomiPrice = 0;
  try { wsomiPrice = await getWsomiPrice(); } catch { /* mainnet unreachable */ }

  const openWithPnl = openTrades.map((t) => {
    const entry     = Number(t.entryPrice);
    const pctChange = wsomiPrice > 0 ? (wsomiPrice - entry) / entry : 0;
    const unrealised = Number(t.usdcSpent) * pctChange;
    return {
      id:           t.id,
      leader:       t.leader,
      token:        t.token,
      usdcSpent:    Number(t.usdcSpent),
      tokenAmount:  Number(t.tokenAmount),
      entryPrice:   entry,
      currentPrice: wsomiPrice,
      unrealisedPnl: unrealised,
      unrealisedPct: pctChange * 100,
      timestamp:    t.timestamp,
    };
  });

  const totalUnrealisedPnl = openWithPnl.reduce((s, p) => s + p.unrealisedPnl, 0);
  const totalRealisedPnl   = closedTrades.reduce((s, t) => s + Number(t.pnl ?? 0), 0);

  return NextResponse.json({
    vault: vault ? {
      virtualUsdc:     Number(vault.virtualUsdc),
      startingCapital: Number(vault.startingCapital),
    } : null,
    openPositions:    openWithPnl,
    closedTrades:     closedTrades.map((t) => ({
      id:          t.id,
      leader:      t.leader,
      token:       t.token,
      usdcSpent:   Number(t.usdcSpent),
      entryPrice:  Number(t.entryPrice),
      exitPrice:   Number(t.exitPrice ?? 0),
      pnl:         Number(t.pnl ?? 0),
      timestamp:   t.timestamp,
    })),
    following:        following.map((f) => f.leader),
    wsomiPrice,
    totalUnrealisedPnl,
    totalRealisedPnl,
  });
}
