import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

// POST /api/vault
// body: { action: 'create', address, virtualUsdc }
//       { action: 'follow', follower, leader }
//       { action: 'unfollow', follower, leader }

export async function POST(req: Request) {
  const body = await req.json();

  if (body.action === 'create') {
    const { address, virtualUsdc } = body;
    if (!address || !virtualUsdc) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

    await prisma.vault.upsert({
      where:  { address: address.toLowerCase() },
      update: {},
      create: {
        address:         address.toLowerCase(),
        virtualUsdc:     virtualUsdc,
        startingCapital: virtualUsdc,
        copyModelKey:    'fixed_available_pct',
        copyModelConfig: { buyPct: 20 },
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'follow') {
    const { follower, leader } = body;
    if (!follower || !leader) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

    await prisma.follow.upsert({
      where:  { follower_leader: { follower: follower.toLowerCase(), leader: leader.toLowerCase() } },
      update: {},
      create: { follower: follower.toLowerCase(), leader: leader.toLowerCase() },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'unfollow') {
    const { follower, leader } = body;
    if (!follower || !leader) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

    await prisma.follow.deleteMany({
      where: { follower: follower.toLowerCase(), leader: leader.toLowerCase() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
