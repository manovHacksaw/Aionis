import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

/**
 * GET /api/agent/leader/[address]/latest-swap
 *
 * Called by the Somnia JSON API Agent (agent ID 1) inside
 * AionisAgentManager.sol → checkLeaderActivity().
 *
 * The agent encodes:
 *   url:      "https://aionis.xyz/api/agent/leader/0x419c.../latest-swap"
 *   selector: "$.swap"   (dot-notation path into the response JSON)
 *
 * Returns the most recent on-chain swap detected from this leader address.
 * Returns 404 if the leader has no recorded swaps yet.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const leader = address.toLowerCase();

  const row = await prisma.leaderSwap.findFirst({
    where:   { leader },
    orderBy: { timestamp: 'desc' },
  });

  if (!row) {
    return NextResponse.json(
      { error: 'No swaps recorded for this leader yet.' },
      { status: 404 }
    );
  }

  /**
   * Response shape — the JSON API agent extracts fields via dot-notation selectors.
   *
   * Examples the agent contract can use:
   *   fetchString(url, "swap.side")        → "BUY" | "SELL"
   *   fetchString(url, "swap.token_in")    → "USDC.e"
   *   fetchString(url, "swap.token_out")   → "WSOMI"
   *   fetchUint(url,   "swap.usd_value", 6) → usd_value × 10^6
   *   fetchUint(url,   "swap.price_raw", 10) → wsomi_price × 10^10
   *   fetchUint(url,   "swap.timestamp", 0)  → unix seconds
   */
  return NextResponse.json({
    swap: {
      leader:     row.leader,
      side:       row.side,
      token_in:   row.tokenIn,
      token_out:  row.tokenOut,
      usd_value:  Number(row.usdValue),
      price_raw:  Number(row.wsomiPrice),  // WSOMI price in USDC.e
      tx_hash:    row.txHash ?? '',
      timestamp:  Math.floor(new Date(row.timestamp).getTime() / 1000), // unix seconds
    },
  });
}
