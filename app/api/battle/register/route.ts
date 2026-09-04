import { NextRequest, NextResponse } from 'next/server';
import { registerBattleOnChain } from '@/lib/services/escrowService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { battleId, ownerA, ownerB, bettingClosesAt } = body;

    if (!battleId || !ownerA || !ownerB || !bettingClosesAt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const txHash = await registerBattleOnChain(battleId, ownerA, ownerB, bettingClosesAt);

    return NextResponse.json({
      success: true,
      txHash,
    });
  } catch (error) {
    console.error('Error in on-chain battle registration endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to register battle on-chain' },
      { status: 500 }
    );
  }
}
