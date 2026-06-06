import { NextResponse }  from 'next/server';
import { prisma }        from '@/lib/prisma';
import { getWsomiPrice } from '@/lib/price';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: rawAddress } = await params;
  const address = rawAddress.toLowerCase();

  const [trades, followerCount, wsomiPrice] = await Promise.all([
    prisma.paperTrade.findMany({
      where:   { leader: address },
      orderBy: { timestamp: 'desc' },
      take:    10,
    }),
    prisma.follow.count({ where: { leader: address } }),
    getWsomiPrice().catch(() => 0),
  ]);

  return NextResponse.json({
    address,
    followerCount,
    wsomiPrice,
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
