import { NextResponse }  from 'next/server';
import { prisma }        from '@/lib/prisma';
import { getWsomiPrice } from '@/lib/price';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: rawAddress } = await params;
  const address = rawAddress.toLowerCase();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [trades, followerCount, wsomiPrice, swapAgg, swapSides, lastSwap] = await Promise.all([
    prisma.paperTrade.findMany({
      where:   { leader: address },
      orderBy: { timestamp: 'desc' },
      take:    10,
    }),
    prisma.follow.count({ where: { leader: address } }),
    getWsomiPrice().catch(() => 0),
    prisma.leaderSwap.aggregate({
      where:  { leader: address, timestamp: { gte: since24h } },
      _count: { id: true },
      _sum:   { usdValue: true },
    }),
    prisma.leaderSwap.groupBy({
      by:    ['side'],
      where: { leader: address, timestamp: { gte: since24h } },
      _count: { id: true },
    }),
    prisma.leaderSwap.findFirst({
      where:   { leader: address },
      orderBy: { timestamp: 'desc' },
      select:  { timestamp: true },
    }),
  ]);

  const buys  = swapSides.find((s) => s.side === 'BUY')?._count.id  ?? 0;
  const sells = swapSides.find((s) => s.side === 'SELL')?._count.id ?? 0;

  return NextResponse.json({
    address,
    followerCount,
    wsomiPrice,
    stats24h: {
      trades: swapAgg._count.id,
      volume: Number(swapAgg._sum.usdValue ?? 0),
      buys,
      sells,
    },
    lastSeen: lastSwap?.timestamp ?? null,
    recentTrades: trades.map((t) => ({
      id:         t.id,
      follower:   t.follower,
      side:       t.side,
      token:      t.token,
      usdcSpent:  Number(t.usdcSpent),
      entryPrice: Number(t.entryPrice),
      exitPrice:  t.exitPrice ? Number(t.exitPrice) : null,
      pnl:        t.pnl ? Number(t.pnl) : null,
      status:     t.status,
      txHash:     t.txHash,
      timestamp:  t.timestamp,
    })),
  });
}
